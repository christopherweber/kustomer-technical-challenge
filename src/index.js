const csv = require('csv-parser')
const fs = require('fs')
const { fetch } = require('cross-fetch')

require('dotenv').config()

const createCustomer = ({
  firstName,
  lastName,
  email,
  homePhone,
  workPhone
} = {}) => ({
  name: `${firstName} ${lastName}`,
  emails: [{ email }],
  phones: [
    {
      type: 'home',
      phone: homePhone
    },
    {
      type: 'work',
      phone: workPhone
    }
  ]
})

/**
 @param {path} path 
 */

const generateCustomerData = (path) => {
  let customers = []
  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (row) => {
        customers.push(createCustomer(row))
      })
      .on('end', (err) => {
        if (err) reject(err)
        resolve(customers)
      })
  })
}

const exportCustomerData = (customers) => {
  let customerPromises = customers.map((customer) =>
    fetch(process.env.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify(customer)
    })
  )

  Promise.all(customerPromises)
    .then((_) => console.log('Successfully exported customer data.'))
    .catch((err) => {
      console.log('There was an error:\n', err.message)
    })
}

fetch(process.env.API_URL, {
  headers: {
    'authorization': `Bearer ${process.env.API_TOKEN}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(console.log)
