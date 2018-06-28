/* eslint-disable */
/* @flow */

// Need to add pm2 process.ready();

declare class Process extends events$EventEmitter {
  abort(): void;
  arch: string;
  argv: Array<string>;
  chdir(directory: string): void;
  config: Object;
  connected: boolean;
  cwd(): string;
  disconnect?: () => void;
  domain?: domain$Domain;
  env: { [key: string]: ?string };
  execArgv: Array<string>;
  execPath: string;
  exit(code?: number): void;
  exitCode?: number;
  getegid?: () => number;
  geteuid?: () => number;
  getgid?: () => number;
  getgroups?: () => Array<number>;
  getuid?: () => number;
  hrtime(time?: [number, number]): [number, number];
  initgroups?: (user: number | string, extra_group: number | string) => void;
  kill(pid: number, signal?: string | number): void;
  mainModule: Object;
  memoryUsage(): {
    rss: number,
    heapTotal: number,
    heapUsed: number,
  };
  nextTick: <T>(cb: (...T) => mixed, ...T) => void;
  pid: number;
  platform: string;
  release: {
    name: string,
    lts?: string,
    sourceUrl: string,
    headersUrl: string,
    libUrl: string,
  };
  send: (
    message: any,
    sendHandleOrCallback?: net$Socket | net$Server | Function,
    callback?: Function,
  ) => void;
  setegid?: (id: number | string) => void;
  seteuid?: (id: number | string) => void;
  setgid?: (id: number | string) => void;
  setgroups?: <Group: string | number>(groups: Array<Group>) => void;
  setuid?: (id: number | string) => void;
  stderr: stream$Writable | tty$WriteStream;
  stdin: stream$Readable | tty$ReadStream;
  stdout: stream$Writable | tty$WriteStream;
  title: string;
  umask(mask: number): number;
  uptime(): number;
  version: string;
  versions: {
    node: string,
    v8: string,
    [key: string]: ?string,
  };
}

declare var process: Process;
