export default function insertTextAtSelection(currentValue, field, text) {
  const start = field.selectionStart ?? currentValue.length;
  const end = field.selectionEnd ?? start;

  return {
    nextValue: `${currentValue.slice(0, start)}${text}${currentValue.slice(end)}`,
    cursorPosition: start + text.length,
  };
}
