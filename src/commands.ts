/**
 * Copyright (c) 2021 Nino
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import otherLinks from './other-links';
import * as core from '@actions/core';
import { join } from 'path';
import centra from '@aero/centra';

const calculateHrTime = (timestamps: [seconds: number, nanoseconds: number]) => {
  const difference = process.hrtime(timestamps);
  return (difference[0] * 1e9 + difference[1]) / 1e6;
};

const SAMBOKAI_DB =
  'https://raw.githubusercontent.com/sambokai/ShortURL-Services-List/master/shorturl-services-list.csv';

const ANDRE_DB = 'https://cdn.jsdelivr.net/gh/Andre601/anti-scam-database@main/database/summary.json';

/**
 * Represents a command.
 */
export interface Command {
  name: string;
  executor(): void | Promise<void>;
}

export const commands: Command[] = [
  {
    name: 'shortlinks',
    async executor() {
      const startedAt = process.hrtime();
      core.info(`Now reading shortlinks from: ${SAMBOKAI_DB}`);

      const req1Time = process.hrtime();
      const res = await centra(SAMBOKAI_DB, 'GET').text();

      core.info(`Request towards ${SAMBOKAI_DB} took ~${calculateHrTime(req1Time).toFixed(2)}ms to complete.`);
      const rawData = res.split(/\n\r?/);
      rawData.shift(); // remove the first entry

      core.info(`Now reading from: ${ANDRE_DB}`);
      const req2Time = process.hrtime();
      const data = await centra(ANDRE_DB, 'GET').json();

      core.info(`Request towards ${ANDRE_DB} took ~${calculateHrTime(req2Time).toFixed(2)}ms to complete.`);
      const actualData = [
        ...new Set(
          ([] as string[]).concat(
            rawData.map((s) => s.slice(0, s.length - 1)),
            data.filter((s: any) => s.affected_platforms.includes('discord')).map((s: any) => s.domain),
            ...otherLinks
          )
        ),
      ].filter(Boolean);

      if (!existsSync(join(__dirname, 'assets'))) await mkdir(join(__dirname, 'assets'));
      await writeFile(join(__dirname, 'assets', 'shortlinks.json'), `${JSON.stringify(actualData, null, '\t')}\n`);

      const endedTime = calculateHrTime(startedAt);
      core.info(`Updated shortlinks data within ~${endedTime.toFixed(2)}ms to retrieve ${actualData.length} links.`);

      process.exitCode = core.ExitCode.Success;
    },
  },
];
