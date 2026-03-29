import 'dotenv/config';
import { spawn } from 'child_process';
import { tool } from '@langchain/core/tools';
import fs from 'node:fs/promises';
import { z } from 'zod';
import chalk from 'chalk';
import path from 'path';

// import { OpenAI } from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.API_KEY,
//   baseURL: process.env.BASE_URL,
//   modelName: process.env.MODEL_NAME,
// });


// 读取文件工具
const readFileTool = tool(

    async ({ filePath }) => {
        console.log(chalk.bgBlue(`读取文件工具`))

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            console.log(`[工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`);
            return content;
        } catch (error) {
            console.error(`[工具调用] read_file("${filePath}") - 失败: ${error.message}`);
            return `读取文件失败: ${error.message}`;
        }
    },
    {
        name: 'read_file',
        description: '读取指定路径的文件内容',
        schema: z.object({
            filePath: z.string().describe('文件路径'),
        }),
    }
)


// 写入文件工具
const writeFileTool = tool(
    async ({ filePath, content }) => {
        console.log(chalk.bgBlue(`写入文件工具`));

        try {

            const directoryPath = path.dirname(filePath);
            if (!await fs.stat(directoryPath).then(stat => stat.isDirectory())) {
                await fs.mkdir(directoryPath, { recursive: true });
            }
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`[工具调用] write_file("${filePath}") - 成功写入 ${content.length} 字节`);
            return `写入文件成功`;
        } catch (error) {
            console.error(`[工具调用] write_file("${filePath}") - 失败: ${error.message}`);
            return `写入文件失败: ${error.message}`;
        }
    },
    {
        name: 'write_file',
        description: '写入指定路径的文件内容',
        schema: z.object({
            filePath: z.string().describe('文件路径'),
            content: z.string().describe('文件内容'),
        }),
    }
)

// 执行命令工具
const execCommandTool = tool(
    async ({ command, workingDirectory }) => {
        console.log(chalk.bgBlue(`执行命令工具`));

        const cwd = workingDirectory || process.cwd();

        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const child_process = spawn(cmd, args, {
                cwd,
                stdio: 'inherit',
                shell: true,
            });

            let errorMsg = '';


            child_process.on('close', (code) => {
                if (code === 0) {
                    const cwdInfo = workingDirectory
                        ? `\n\n重要提示：命令在目录 "${workingDirectory}" 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDirectory: "${workingDirectory}" 参数，不要使用 cd 命令。`
                        : '';
                    resolve(`命令执行成功: ${command}${cwdInfo}`);
                } else {
                    console.error(`[工具调用] exec_command("${command}") - 失败: 退出码 ${code}`);
                    resolve(`执行命令失败: 退出码 ${code}, 错误信息: ${errorMsg}`);
                }
            });
            child_process.on('error', (error) => {
                errorMsg = error.message;
                console.error(`[工具调用] exec_command("${command}") - 失败: ${errorMsg}`);
            });
        });
    },
    {
        name: 'exec_command',
        description: '执行指定命令',
        schema: z.object({
            command: z.string().describe('命令'),
            workingDirectory: z.string().describe('工作目录，可选，默认当前工作目录'),
        }),
    }
)

// 列出目录

const listDirectoryTool = tool(
    async ({ directoryPath }) => {
        console.log('directoryPath', directoryPath);
        console.log(chalk.bgBlue(`列出目录工具`,));

        try {
            const files = await fs.readdir(directoryPath);
            return `目录内容:\n${files.map(f => `- ${f}`).join('\n')}`;
        } catch (error) {
            console.error(`[工具调用] list_directory("${directoryPath}") - 失败: ${error.message}`);
            return `列出目录失败: ${error.message}`;
        }
    },
    {
        name: 'list_directory',
        description: '列出指定目录的文件和目录',
        schema: z.object({
            directoryPath: z.string().describe('目录路径'),
        }),
    }
)


export { readFileTool, writeFileTool, execCommandTool, listDirectoryTool };