class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.data = [];
    this.color = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.cache = new Map();
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
    if (data && typeof data === "object" && data.color) {
      current.data.push(data);
      current.color = data.color;
    } else {
      console.error("Invalid data provided for insertion:", data);
    }
  }

  searchPrefix(prefix) {
    if (this.cache.has(prefix)) {
      return this.cache.get(prefix);
    }

    let current = this.root;
    for (let char of prefix.toLowerCase()) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }

    const results = this._findAllWords(current);
    this.cache.set(prefix, results);
    return results;
  }

  searchFuzzy(searchTerm, maxDistance = 0.8) {
    const results = [];
    const allTopics = this.getAllTopics();
    const matchedTopics = new Set();
    const prefixResults = this.searchPrefix(searchTerm);
    prefixResults.forEach((item) => {
      matchedTopics.add(item);
      results.push(item);
    });

    allTopics.forEach((topic) => {
      const distance = jaroWinkler(
        searchTerm.toLowerCase(),
        topic.toLowerCase()
      );
      if (distance >= maxDistance && !matchedTopics.has(topic)) {
        const topicResults = this.searchPrefix(topic);
        if (topicResults.length > 0) {
          topicResults.forEach((item) => {
            if (!matchedTopics.has(item)) {
              matchedTopics.add(item);
              results.push(item);
            }
          });
        } else {
          const node = this.findNode(topic.toLowerCase());
          if (node) {
            results.push(...node.data);
          }
        }
      }
    });

    return results;
  }
  findNode(word) {
    let current = this.root;
    for (let char of word.toLowerCase()) {
      if (!current.children[char]) {
        return null;
      }
      current = current.children[char];
    }
    return current.isEndOfWord ? current : null;
  }
  _findAllWords(node) {
    let results = [];
    if (node.isEndOfWord) {
      results.push(...node.data);
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

function jaroWinkler(s1, s2) {
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n === 0 ? 1.0 : 0.0;

  const matchWindow = Math.floor(Math.max(m, n) / 2) - 1;
  const s1Matches = new Array(m).fill(false);
  const s2Matches = new Array(n).fill(false);
  let matches = 0;

  for (let i = 0; i < m; i++) {
    for (
      let j = Math.max(0, i - matchWindow);
      j < Math.min(n, i + matchWindow + 1);
      j++
    ) {
      if (s1Matches[i] || s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let t = 0;
  let k = 0;

  for (let i = 0; i < m; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) t++;
    k++;
  }

  t /= 2;

  const jaroDistance =
    (matches / m + matches / n + (matches - t) / matches) / 3;
  const prefixLength = Math.min(s1.length, s2.length, 4);
  let prefixScore = 0;

  for (let i = 0; i < prefixLength; i++) {
    if (s1[i] === s2[i]) prefixScore++;
    else break;
  }

  return jaroDistance + prefixScore * 0.1 * (1 - jaroDistance);
}

const serializeTrie = (trie) => {
  const { cache, ...trieWithoutCache } = trie;
  return JSON.stringify(trieWithoutCache);
};
const deserializeTrie = (json) => {
  const trie = Object.assign(new Trie(), JSON.parse(json));
  trie.root = Object.assign(new TrieNode(), trie.root);
  return trie;
};

export { Trie, TrieNode, serializeTrie, deserializeTrie };
