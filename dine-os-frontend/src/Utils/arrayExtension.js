if (!Array.prototype.getError) {
  Array.prototype.getError = function (path) {
    const parts = path.split(".");
    
    return this.find((err) => {
        const errPathParts = err.path?.split(".") || [];
        return parts.every((part, index) => errPathParts[index] === part);
    })?.msg;
  };
}