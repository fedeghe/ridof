function TagsManager (init, config) {
    this.activeCheck = !!config;
    this.config = config || function () { return true; };
    console.log(this.config.toString());
    console.log('==========');
    this.tags = [init];
    this.index = 0;
}

TagsManager.prototype.getCurrent = function () {
    return this.tags[this.index];
};

TagsManager.prototype.canMoveTo = function (nextTag, state) {
    var currentTag = this.getCurrent();
    return this.activeCheck
        ? this.config(currentTag, nextTag, state)
        : true;
};

TagsManager.prototype.add = function (tag, index) {
    this.index = index || (this.index + 1);
    this.tags[this.index] = tag;
};

TagsManager.prototype.reset = function (to) {
    this.tags = to ? this.tags.slice(0, to) : [];
};
