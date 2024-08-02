process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { Beacon } = require('netlocklib/dist/Beacon');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
    let b = new Beacon('testing6', 'testing os', 'https://localhost')

    let res = await b.requestToken("MindoverMatter")

    console.log(res)
    res = await b.addUser('Bob', true)
    await delay(1000)
    console.log(res)
    res = await b.logUser('Bob', false)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', true)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', false)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', true)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', false)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', true)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', false)
    await delay(1000)

    console.log(res)
    res = await b.logUser('Bob', true)
    await delay(1000)

    console.log(res)

})()