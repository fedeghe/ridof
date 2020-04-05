function TagsManager (init, config) {
    this.activeCheck = !!config;
    this.config = config || {};
    this.tags = [init];
    this.size = 1;
}
TagsManager.prototype.getCurrent = function () {
    return this.tags[this.size - 1];
};
TagsManager.prototype.canMoveTo = function (tag) {
    if (this.activeCheck) {
        // tag in this.config
        var keys = Object.keys(this.config),
            currentKey = this.tags[this.size - 1],
            key = ~~(keys.indexOf(tag));
        return key >= 0
            ? this.config[currentKey].includes(key)
            : false;
    }
    return true;
};
TagsManager.prototype.add = function (tag) {
    this.size++;
    this.tags.push(tag);
};
TagsManager.prototype.reset = function (to) {
    this.tags = to ? this.tags.slice(0, to) : [];
    this.size = to ? this.tags.length : 1;
};
