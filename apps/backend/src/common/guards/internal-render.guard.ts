import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PdfService } from '../../pdf/pdf.service';

/**
 * Protects the `/internal/*` endpoints that the PDF renderer reads from.
 *
 * These endpoints return the *full* record — including unit costs, total cost
 * and gross margin — so they previously being gated on a hardcoded
 * `x-internal-pdf-render: 1` header meant anyone who could guess a UUID could
 * read a company's pricing internals.
 *
 * Two callers are legitimate:
 *   1. The headless renderer, which presents a short-lived HMAC render token.
 *   2. The dashboard's Live Preview iframe, which runs in a signed-in browser
 *      and presents the user's normal JWT.
 */
@Injectable()
export class InternalRenderGuard implements CanActivate {
  constructor(
    private readonly pdfService: PdfService,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const renderToken = request.headers['x-internal-render-token'];
    if (
      typeof renderToken === 'string' &&
      this.pdfService.isValidRenderToken(renderToken)
    ) {
      return true;
    }

    const authorization = request.headers['authorization'];
    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      try {
        const payload = this.jwtService.verify(authorization.slice(7));
        request.user = {
          id: payload.sub,
          email: payload.email,
          companyId: payload.companyId,
        };
        return true;
      } catch {
        // Fall through to the rejection below.
      }
    }

    throw new ForbiddenException('Access denied');
  }
}
