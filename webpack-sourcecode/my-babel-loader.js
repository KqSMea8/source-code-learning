module.exports = function(source) {
  return `
    var s = "I am liubin";
    ${source}
  `;
};
