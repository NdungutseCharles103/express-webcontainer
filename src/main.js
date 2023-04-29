import "./style.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
// import { startShell } from "./utils";
import { FitAddon } from "xterm-addon-fit";

document.querySelector("#app").innerHTML = `
  <div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe src="/loading.html"></iframe>
    </div>
  </div>
  <div class="terminal"></div>
`;

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector("iframe");

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector("textarea");
/** @type {HTMLTextAreaElement | null} */
const terminalEl = document.querySelector(".terminal");

let webcontainerInstance;

async function startShell(terminal) {
  const shellProcess = await webcontainerInstance.spawn("jsh", {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );

  const input = shellProcess.input.getWriter();

  terminal.onData((data) => {
    input.write(data);
  });

  return shellProcess;
}

/** @param {string} content*/

async function writeIndexJS(content) {
  await webcontainerInstance.fs.writeFile("/index.js", content);
}

window.addEventListener("load", async () => {
  textareaEl.value = files["index.js"].file.contents;
  textareaEl.addEventListener("input", (e) => {
    writeIndexJS(e.currentTarget.value);
  });

  const terminal = new Terminal({
    convertEol: true,
  });
  terminal.open(terminalEl);
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  fitAddon.fit();
  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  // Wait for `server-ready` event
  webcontainerInstance.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });

  startShell(terminal);
});
