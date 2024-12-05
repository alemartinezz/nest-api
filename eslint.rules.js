const plugin = {
  meta: {
    name: 'eslint-plugin-custom-rules',
    version: '1.0.0',
  },
  rules: {
    // Rule 1: No blank line between consecutive closing braces
    'no-blank-line-between-closing-braces': {
      meta: {
        type: 'layout',
        docs: {
          description: 'Ensure no blank lines between consecutive closing braces',
          category: 'Stylistic Issues',
          recommended: false,
        },
        fixable: 'whitespace',
        schema: [],
      },
      create(context) {
        return {
          Program() {
            const sourceCode = context.getSourceCode();
            const lines = sourceCode.lines;

            let previousLineHasClosingBrace = false;

            lines.forEach((line, index) => {
              const trimmedLine = line.trim();
              const nextLine = lines[index + 1]?.trim();

              if (previousLineHasClosingBrace && nextLine === '}') {
                context.report({
                  loc: {
                    start: { line: index + 1, column: 0 },
                    end: { line: index + 2, column: 0 },
                  },
                  message: 'There should be no blank line between consecutive closing braces.',
                  fix(fixer) {
                    const lineStart = sourceCode.lineStartIndices[index + 1];
                    const nextLineStart = sourceCode.lineStartIndices[index + 2] || lineStart + 1;

                    return fixer.replaceTextRange([lineStart, nextLineStart], '');
                  },
                });
              }

              previousLineHasClosingBrace = trimmedLine === '}';
            });
          },
        };
      },
    },

    // Rule 2: Ensure a blank line before return statements
    'blank-line-before-return': {
      meta: {
        type: 'layout',
        docs: {
          description: 'Ensure a blank line before return statements',
          category: 'Stylistic Issues',
          recommended: false,
        },
        fixable: 'whitespace',
        schema: [],
      },
      create(context) {
        return {
          ReturnStatement(node) {
            const sourceCode = context.getSourceCode();
            const previousToken = sourceCode.getTokenBefore(node, { includeComments: false });

            if (previousToken && previousToken.loc.end.line === node.loc.start.line - 1) {
              context.report({
                node,
                message: 'A blank line is required before return statements.',
                fix(fixer) {
                  return fixer.insertTextBefore(node, '\n');
                },
              });
            }
          },
        };
      },
    },

    // Rule 4: Remove blank lines before 'catch' blocks
    'no-blank-line-before-catch': {
      meta: {
        type: 'layout',
        docs: {
          description: 'Remove blank lines before catch blocks',
          category: 'Stylistic Issues',
          recommended: false,
        },
        fixable: 'whitespace',
        schema: [],
      },
      create(context) {
        return {
          TryStatement(node) {
            const sourceCode = context.getSourceCode();
            const catchClause = node.handler;

            if (catchClause) {
              const beforeCatch = sourceCode.getTokenBefore(catchClause, { includeComments: false });
              const textBetween = sourceCode.text.slice(
                beforeCatch.range[1],
                catchClause.range[0]
              );

              if (textBetween.includes('\n\n')) {
                context.report({
                  node: catchClause,
                  message: 'There should be no blank lines before catch blocks.',
                  fix(fixer) {
                    const fixedText = textBetween.replace(/\n\n/g, '\n');
                    return fixer.replaceTextRange(
                      [beforeCatch.range[1], catchClause.range[0]],
                      fixedText
                    );
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};

export default plugin;