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
        // write your solution here
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
    starter: `function twoSum(nums, target) {
  // write your solution here
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
  },
  {
    id: "python",
    label: "Python",
    monaco: "python",
    piston: { language: "python", version: "3.10.0" },
    starter: `def two_sum(nums, target):
    # write your solution here
    pass

print(two_sum([2, 7, 11, 15], 9))
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
    // write your solution here
    return 0;
}
`,
  },
];

export const getLanguage = (id) => LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];