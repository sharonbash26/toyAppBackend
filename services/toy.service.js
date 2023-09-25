import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    get,
    remove,
    save
}
    
function query(filterBy = {},sort) {
    let toysToDisplay = toys
    // let   toysToDisplay=[]   
    const {maxPrice, minPrice, name, labels} = filterBy || {}
    const {by,asc} = sort || {}
    if (name) {
        const regExp = new RegExp(filterBy.name, 'i')
        toysToDisplay = toysToDisplay.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.labels && filterBy.labels[0]) {
        console.log('toyToDisplay',toysToDisplay)
          toysToDisplay =   toysToDisplay.filter(toy => toy.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.inStock) { 
          toysToDisplay =   toysToDisplay.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }

    if (maxPrice && minPrice) {
    filterBy.maxPrice = (+filterBy.maxPrice) ? +filterBy.maxPrice : Infinity
    filterBy.minPrice = (+filterBy.minPrice) ? +filterBy.minPrice : -Infinity
    
      toysToDisplay =   toysToDisplay.filter(toy => (toy.price <= filterBy.maxPrice) && (toy.price >= filterBy.minPrice))

}

    if (by && asc) {
      toysToDisplay.sort((toy1, toy2) => {
        const dir = JSON.parse(sort.asc) ? 1 : -1
        if (sort.by === 'price') return (toy1.price - toy2.price) * dir
        if (sort.by === 'name') return toy1.name.localeCompare(toy2.name) * dir
    })
}

    return Promise.resolve(toysToDisplay)
}

function get(toyId) {
    console.log('Inside get function with toyId:', toyId);
    const toy = toys.find(toy => toy.id === toyId)
    if (!toy) return Promise.reject('toy not found!')
    return Promise.resolve(toy)
}

function remove(toyId) {
    console.log('Trying to remove toy with ID:', toyId);
    console.log('Current toy IDs:', toys.map(toy => toy.id));
    const idx = toys.findIndex(toy => toy.id === toyId)
    if (idx === -1) return Promise.reject('No Such toy')
    const toy = toys[idx]
    // if (toy.owner.id !== loggedinUser._id) return Promise.reject('Not your toy')
    toys.splice(idx, 1)
    return _saveToysToFile()

}

function save(toy) {
    if (toy.id) {
        const toyToUpdate = toys.find(currToy => currToy.id === toy.id)
        // if (toyToUpdate.owner.id !== loggedinUser._id) return Promise.reject('Not your toy')
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
    } else {
        toy.id = _makeId()
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
}

function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {

        const toysStr = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
}
