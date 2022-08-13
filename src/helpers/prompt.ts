import * as readline from 'readline';

export const prompt = (question: string): Promise<string> => {
  const promptReadline = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    function showPrompt() {
      promptReadline.question(question, (answer) => {
        if (!answer) {
          showPrompt();
          return;
        }

        promptReadline.close();
        resolve(answer);
      });
    }

    showPrompt();
  });
};
