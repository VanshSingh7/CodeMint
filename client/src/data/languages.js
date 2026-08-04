// Central place for supported languages.
// `monaco` = language id Monaco understands.
// `piston` = { language, version } shape Piston's /execute endpoint expects.
// Keeping this separate from the Editor component means adding a language
// later (Phase 3, wiring Piston) is a one-place edit, not a hunt through JSX.

export const LANGUAGES = [
  {
    id: "java",
    label: "Java",
    monaco: "java",
    piston: { language: "java", version: "15.0.2" },
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeMint!");
    }
}
`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    monaco: "javascript",
    piston: { language: "javascript", version: "18.15.0" },
    starter: `console.log("Hello, CodeMint!");
`,
  },
  {
    id: "python",
    label: "Python",
    monaco: "python",
    piston: { language: "python", version: "3.10.0" },
    starter: `print("Hello, CodeMint!")
`,
  },
  {
    id: "cpp",
    label: "C++",
    monaco: "cpp",
    piston: { language: "cpp", version: "10.2.0" },
    starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, CodeMint!" << endl;
    return 0;
}
`,
  },
];

export const getLanguage = (id) => LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];