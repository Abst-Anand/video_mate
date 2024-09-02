class Cache {
  constructor(ttl) {
    this.ttl = ttl; //Timt-To-live in milliSeconds
    this.cache = {}; // Object to store in cache entries
    this.size = 0;
  }

  set(key, value) {
    const expiresAt = Date.now() + this.ttl;
    this.cache[key] = { value, expiresAt };
    this.size++
  }

  getSize(){
    return this.size
  }

  get(key) {
    const entry = this.cache[key];

    //entry not found in cache Table
    if (!entry) return null;

    //Entry Expired
    if (Date.now() > entry.expiresAt) {
      delete this.cache[key];
      return null;
    }

    return this.cache[key];
  }

  delete(key) {
    const entry = this.cache[key];

    if (!entry) {
      console.log(`${key} not cached`);
      return -1;
    }

    delete this.cache[key];
    this.size--;
    return 1;
  }

  clearExpiredEntries() {
    const now = Date.now();

    for (const key in this.cache) {
      if (now >= this.cache[key].expiresAt) delete this.cache[key];
    }
  }

  printAllCachedData(){
    for(const key in this.cache){
        console.log(this.cache[key])
    }
  }
}

/*
const cache = new Cache(60000); // TTL of 60 seconds

const objToStore = {
  name: 'Anand',
  email:'araaz56@gmail.com',
  accessToken:'something.hyihdas.iu3yqed', 
  refreshToken : 'something.sdfd.fwehio'
};

cache.set("TestData", objToStore)
cache.printAllCachedData()
console.log(cache.getSize())

console.log(cache.get("TestData"))

cache.delete("TestData")
console.log(cache.getSize())
cache.printAllCachedData()
*/
export { Cache };
