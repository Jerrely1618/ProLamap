class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.data = null;
    this.color = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, data) {
    let current = this.root;
    for (let char of word.toLowerCase()) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    current.data = data;
    current.color = data.color;
  }

  searchPrefix(prefix) {
    let current = this.root;
    for (let char of prefix.toLowerCase()) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }
    return this._findAllWords(current);
  }

  _findAllWords(node) {
    let results = [];
    if (node.isEndOfWord) {
      results.push(node.data);
    }
    for (let char in node.children) {
      results.push(...this._findAllWords(node.children[char]));
    }
    return results;
  }
  getAllTopics(node = this.root, prefix = "") {
    const topics = [];
    if (node.isEndOfWord) {
      topics.push(this.capitalize(prefix));
    }
    for (let char in node.children) {
      topics.push(...this.getAllTopics(node.children[char], prefix + char));
    }
    return topics;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

const serializeTrie = (trie) => JSON.stringify(trie);
const deserializeTrie = (json) => {
  const trie = Object.assign(new Trie(), JSON.parse(json));
  trie.root = Object.assign(new TrieNode(), trie.root);
  return trie;
};

export { Trie, TrieNode, serializeTrie, deserializeTrie };
