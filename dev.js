const { spawn } = require('child_process');

const commands = [
    { name: 'server', command: 'nodemon server.js' },
    { name: 'client', command: 'npm --prefix client run dev' }
];

let stopping = false;
const children = commands.map(({ name, command }) => {
    const child = spawn(command, {
        cwd: __dirname,
        env: process.env,
        stdio: 'inherit',
        shell: true
    });
    child.on('exit', code => {
        if (stopping) return;
        if (code && code !== 0) console.error(`${name} exited with code ${code}. Stopping the development environment.`);
        stopping = true;
        children.forEach(process => {
            if (process !== child) process.kill();
        });
        process.exit(code || 0);
    });
    return child;
});

const stop = () => {
    stopping = true;
    children.forEach(child => child.kill());
    process.exit();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
