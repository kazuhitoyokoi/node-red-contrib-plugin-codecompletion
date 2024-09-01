# node-red-contrib-plugin-codecompletion

This plugin enables the code completion in the code editor of function nodes.
Local LLM, [Granite Code Model](https://github.com/ibm-granite/granite-code-models) is used in the backend to generate JavaScript code.
While typing the code manually, the editor will automatically suggest the generated code based on the existing code.
The user can accept and insert the suggested code by simply pressing the Tab key.

<img width="1440" alt="fizzbuzz" src="https://github.com/user-attachments/assets/2b57102b-e572-4335-919d-66907399391f">

## Setting up
Since this plugin uses [Ollama](https://github.com/ollama/ollama), users need to install it in advance.

- For Windows and macOS

  To set up the Ollama environment, you can use the installer provided on the following website.

  https://ollama.com/download

- For Linux

  Run the following command in the terminal.
  ```
  curl -fsSL https://ollama.com/install.sh | sh
  ollama serve
  ```

## Demonstration
Generating FizzBuzz code


https://github.com/user-attachments/assets/b9dabb40-ee5b-47c6-ace5-979d3cb5e03f


