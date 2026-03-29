// const { spawn } = require('child_process');

// const ls = spawn('ls', ['-lh', '/usr']);

// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// ls.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`);
// });

// ls.on('close', (code) => {
//   console.log(`子进程退出，退出码 ${code}`);
// });

const { spawn } = require('child_process');

const command = 'ls -a'
const cwd = process.cwd();

const [cmd, ...args] = command.split(' ');

const child_process = spawn(cmd, args, {
  cwd,
  stdio: 'inherit',
  shell: true,
})

child_process.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});

child_process.on('error', (error) => {
  console.error(`子进程错误: ${error}`);
});

child_process.on('exit', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});
