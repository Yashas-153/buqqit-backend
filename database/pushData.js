const prisma = require('../database/prismaPostgress');
const fs = require('fs');


// async function main() {
//     // Read data from the JSON file
//     const jsonData = fs.readFileSync('/Users/yashas/Projects/Studio Booking App/Backend/database/data.json', 'utf8');
//     const { users, studios, addresses, availability } = JSON.parse(jsonData);

//     // Insert users into the database
//     for (const user of users) {
//         await prisma.user.create({ data: user });
//     }

//     // Insert studios into the database
//     for (const studio of studios) {
//         await prisma.studio.create({ data: studio });
//     }

//     // Insert addresses into the database
//     for (const address of addresses) {
//         await prisma.address.create({ data: address });
//     }

//     // Insert availability into the database
//     for (const avail of availability) {
//         await prisma.availability.create({ data: avail });
//     }

//     console.log('Data inserted successfully!');
const imageUrls = [
    "https://media.istockphoto.com/id/157676635/photo/empty-dance-studio.jpg?s=1024x1024&w=is&k=20&c=C6OlpVz9wQcqyT6ZfvM3rRaIGzDavV_qFcNUyjRcEP8=",
    "https://media.istockphoto.com/id/1093914934/photo/empty-studio-with-photography-lighting.jpg?s=1024x1024&w=is&k=20&c=MuL55Ro1o66iz3_k1wn6JajCilpgxUWkH10RTp1Z0as=",
    "https://media.istockphoto.com/id/918337964/photo/large-photo-studio-with-professional-lighting.jpg?s=1024x1024&w=is&k=20&c=R89vDhrnR3J-QRrZ5ZctIyOBXDNEXKybrxd6iP1eBxU=",
    "https://media.istockphoto.com/id/883100408/photo/professional-fashion-shoot.jpg?s=1024x1024&w=is&k=20&c=xdCD76H3vSDTM9p_1Ijk0LGP8bHU-bjv4qM2wUZfXDU=",
    "https://media.istockphoto.com/id/1129766353/photo/crew-working-together-in-the-studio.jpg?s=1024x1024&w=is&k=20&c=0p-arCT4NeBIZK0U-zULz1zISbZQQNyPVyK_af7lrVE=",
    "https://media.istockphoto.com/id/909546146/photo/modern-photostudio-with-blank-screen-and-wooden-chair-3d-rendering.jpg?s=1024x1024&w=is&k=20&c=7eJyBkJ7lAAI4tVXAyz-VQ1z1GNYHjyNqkeeGCIpNYI=",
    "https://media.istockphoto.com/id/1448855061/vector/3d-realistic-interior-of-modern-photo-studio-with-chair-and-professional-lighting-equipment.jpg?s=1024x1024&w=is&k=20&c=BDTpYIIbCd9m7zXViO-qOB-oTlcKDqOdgXaAlpQJZAo=",
    "https://media.istockphoto.com/id/1358087480/photo/minimal-podcast-setup.jpg?s=1024x1024&w=is&k=20&c=ETtP394fV01BfO_6dTaKMXl9b83stj2xtZUnDA7BD2M=",
    "https://media.istockphoto.com/id/1492675396/photo/recording-studio.jpg?s=1024x1024&w=is&k=20&c=XGiGCObSiovZI1D4K0HD6r5FQIcvZTJCuGCeJ37BDnM=",
    "https://media.istockphoto.com/id/1356150708/photo/podcast-studio.jpg?s=1024x1024&w=is&k=20&c=tQk9uX22GmekuaTEuRSaKgxjx2c8dY9gZbsMCFmjZRQ=",
    "https://media.istockphoto.com/id/1327727145/photo/talking-about-important-stuff.jpg?s=1024x1024&w=is&k=20&c=7PUKmo8NdPQGab4qCPNECWeLcq5R9OEIPENrVON1Bvw=",
    "https://media.istockphoto.com/id/1317443692/photo/two-smiling-women-talking-and-recording-the-podcast-in-a-studio.jpg?s=1024x1024&w=is&k=20&c=kPMWn0XfI-4rqlfuE5TdarLvra5Iq7Dz1XcrM00fHzs=",
    "https://images.pexels.com/photos/6953870/pexels-photo-6953870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/6953672/pexels-photo-6953672.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://www.pristinestudios.in/assets/images/products/studio-on-rent.png"
];

async function main(){
    const response = await prisma.studio.findMany()
    const studioIds = response.map(item=>item.id)
    console.log(studioIds)
    let studioCounter = 0;
    try{
        for(let i = 0;i<15;i++){
            const response = await prisma.photo.create({data:{
                studio_id : studioIds[studioCounter],
                url:imageUrls[(i+8)%15],
                upload_date:new Date()
            }})
            studioCounter++;
        }
    }
    catch(err){
        console.log(err)
    }
    console.log("uploaded sucessfully")
}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
