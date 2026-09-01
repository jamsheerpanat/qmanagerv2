import { Controller, Get } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface BuildInfo {
  sha: string;
  builtAt: string;
}

/**
 * Reports which build of the API is running, for the version label on the
 * login page. Deliberately unauthenticated: it is read before anyone can sign
 * in, and it exposes nothing beyond a commit hash and a timestamp.
 *
 * The API and the web app are built and restarted separately, so a deploy can
 * update one and not the other. Showing both is the point — a label that only
 * knew about the frontend could report a new version while the API still ran
 * the old code.
 */
@Controller('version')
export class VersionController {
  /**
   * Read once at startup. The file is written by write-build-info.js after the
   * compile step, so it describes the running build rather than the checkout.
   */
  private readonly info: BuildInfo = VersionController.read();

  private static read(): BuildInfo {
    try {
      const file = path.join(__dirname, '..', 'build-info.json');
      return JSON.parse(fs.readFileSync(file, 'utf8')) as BuildInfo;
    } catch {
      return { sha: 'unknown', builtAt: 'unknown' };
    }
  }

  @Get()
  getVersion(): BuildInfo {
    return this.info;
  }
}
