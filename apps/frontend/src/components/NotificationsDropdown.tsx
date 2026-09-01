import { useState, useEffect, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import { api } from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";

const POLL_INTERVAL_MS = 30_000;

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Only the badge count is polled. The list — fifty rows, joined and ordered —
   * was being fetched every thirty seconds per open tab to render a number, and
   * is only ever seen once the dropdown is open.
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data);
    } catch {
      // A failed poll is not worth surfacing; the next tick retries.
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch {
      // Leave whatever is already on screen.
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    let timer: ReturnType<typeof setInterval> | undefined;

    // Polling a background tab costs a request and a permissions resolution
    // for a badge nobody is looking at. Stop while hidden, and refresh once on
    // the way back so the count is current when the tab is focused again.
    const start = () => {
      if (timer) return;
      timer = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        fetchUnreadCount();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchUnreadCount]);

  // The list is loaded when the panel is opened, not on a timer.
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);


  async function markAsRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  async function markAllAsRead() {
    try {
      await api.patch(`/notifications/read-all`);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-3 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Check className="w-3 h-3 mr-1" /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-sm transition-colors cursor-pointer hover:bg-gray-50 ${!notif.isRead ? "bg-blue-50/50" : ""}`}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-900">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
