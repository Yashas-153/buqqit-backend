const { faker } = require('@faker-js/faker');
const fs = require('fs');
const prisma = require('./prismaPostgress');

let studioIds;

console.log("ran generateFakeData.js")

const getHosts = async ()=>{
  try{
    const studios = await prisma.user.findMany()
    studioIds = studios.map(item=>item.id)

    const data = {
      // users,
      // studios,
      // addresses,
      // availability,
      photos
    };
    
    const jsonData = JSON.stringify(data, null, 2); 
    
    fs.writeFileSync('data.json', jsonData, 'utf8');
    
  }
  catch(err){
    console.log("error",err)
  }
}

function postPhotos(){
  
}

async function main(){
  const hosts = await getHosts();
  const hostids = hosts.map(host=>host.id)
  console.log("hostids are ",hostids);
  studioData = generateFakeStudios(15,hostids)
}

main();

// Initialize counters for sequential IDs
let userIdCounter = 1;
let studioIdCounter = 1;
let addressIdCounter = 1;
let availabilityIdCounter = 1;

function generateNames(count) {
  let names = [];
  for (let i = 0; i < count; i++) {
    let name = faker.person.fullName();
    names.push(name);
  }
  return names;
}

function generateFakeUsers(names) {
  return names.map((item) => ({
    id: userIdCounter++, // Use and increment the counter for each user
    name: item,
    email: faker.internet.email({ firstName: item.split(' ')[0] }),
    password: faker.internet.password(),
    phone_number: faker.phone.number(),
    profile_picture: faker.image.avatar(),
    bio: faker.lorem.sentences(),
    user_type: faker.helpers.arrayElement(['USER', 'HOST']),
  }));
}

function generateFakeAddresses(studioIds) {
  return studioIds.map(studio_id => ({
    id: addressIdCounter++, // Use and increment the counter for each address
    studio_id,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    pincode: faker.location.zipCode(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  }));
}

function generateFakeStudios(count, hostIds) {
  return Array.from({ length: count }).map(() => ({
    id: studioIdCounter++, // Use and increment the counter for each studio
    host_id: faker.helpers.arrayElement(hostIds),
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    studio_type: faker.helpers.arrayElement(['Photography', 'Dance', 'Podcast', 'Gaming', 'Music', 'Band']),
    hourly_rate: parseInt(faker.commerce.price({ min: 400, max: 800, dec: 0 })),
    max_people: faker.number.int({ min: 1, max: 20 }),
    min_duration: faker.number.int({ min: 1, max: 8 }),
    size: faker.number.int({ min: 200, max: 2000 }),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));
}

function generateFakeAvailability(studioIds) {
  const start = new Date('2024-01-01T06:00:00Z');
  const end = new Date('2024-01-01T24:00:00Z');
  
  return studioIds.flatMap(studio_id => {
    return Array.from({ length: 7 }).map((_, dayOfWeek) => ({
      id: availabilityIdCounter++, // Use and increment the counter for each availability record
      studio_id,
      day_of_week: dayOfWeek,
      start_time: faker.date.between({ from: start, to: new Date(start.getTime() + 3 * 60 * 60 * 1000) }),
      end_time: faker.date.between({ from: new Date(start.getTime() + 4 * 60 * 60 * 1000), to: end }),
      is_recurring: faker.datatype.boolean(),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    }));
  });
}


// const names = generateNames(30);
// const users = generateFakeUsers(names);
// const hosts = users.filter((user) => user.user_type ==="HOST")
// const hostids = hosts.map(item=>item.id)
// console.log(hostids)

// const studios = generateFakeStudios(15, hostids);
// const addresses = generateFakeAddresses(studios.map(studio => studio.id));
// const availability = generateFakeAvailability(studios.map(studio => studio.id));


const data = {
  // users,
  // studios,
  // addresses,
  // availability,
  photos
};

const jsonData = JSON.stringify(data, null, 2); 

fs.writeFileSync('data.json', jsonData, 'utf8');

