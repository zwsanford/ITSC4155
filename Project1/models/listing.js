const {v4: uuidv4} = require('uuid');

const listings = [
    {
        id: '1',
        title: 'Blue Couch',
        seller:'Harrison H',
        condition:'Like New',
        price: 135.00,
        details:'Couch I owned for the semester, cant wait to get rid of it',
        image:'/images/couch.jpg',
        totalOffers: 2,
        active: true

    },
    {
        id: '2',
        title: 'Ping Pong table',
        seller:'Jacob Y',
        condition:'Like New',
        price: 50.00,
        details:'Bought it to play pong and only used once, pls take off me',
        image:'/images/PingPong.jpg',
        totalOffers: 4,
        active: true
        
    },
    {
        id: '3',
        title: 'Record Player',
        seller:'Mary S',
        condition:'New',
        price: 25.00,
        details:'Never ended up buying records for it so never used',
        image:'/images/RecordPlayer.jpg',
        totalOffers: 0,
        active: true
        
    },
    {
        id: '4',
        title: 'Electric Scooter',
        seller:'Ryan P',
        condition:'Fair',
        price: 180.00,
        details:'Used this for 3 years, gets up to 15 mph and battery lasts like 8 hours, graduating so dont need it anymore, great for getting around campus!',
        image:'/images/ElectricScooter.jpg',
        totalOffers: 1,
        active: true
        
    },
    {
        id: '5',
        title: 'Ikea Chair',
        seller:'Harrison H',
        condition:'Fair',
        price: 20.00,
        details:'Ikea chair I had for my desk but cant take back home with me, no marks just used',
        image:'/images/IkeaChair.jpg',
        totalOffers: 2,
        active: true
        
    },
    {
        id: '6',
        title: 'Stussy Winter puffer',
        seller:'Kaci B',
        condition:'Like New',
        price: 200.00,
        details:'Stussy puffer, used somewhat but no stains or anything like that, wont need this where im going...CANCUNNNN',
        image:'/images/StussyPuffer.jpg',
        totalOffers: 2,
        active: true
        
    },
   
];

exports.find = function(search){
    let sortlistings = listings.sort((a, b)=>a.price - b.price);
    if(search){
        search = search.toLocaleLowerCase();
        sortlistings = sortlistings.filter(listing => (
            listing.title.toLowerCase().includes(search) || 
            listing.details.toLowerCase().includes(search)
        ));

    }
    return sortlistings;
}

exports.findById = function(id){
    return listings.find(listing=>listing.id ===id);
}

exports.save = function(listing){
    listing.id = uuidv4();
    listing.image = '/images/' + listing.image;
    listing.totalOffers = 0;
    listing.seller = 'Harrison';
    listing.price = listing.price;
    listings.push(listing);
}

exports.updateById = function(id, newlisting){
    let listing = listings.find(listing=>listing.id ===id);
    if(listing){
        listing.condition = newlisting.condition;
        listing.title = newlisting.title;
        listing.price = newlisting.price;
        listing.details = newlisting.details;
        listing.image = '/images/' + newlisting.image;
        return true;
    }else{
        return false;
    }

}

exports.deleteById = function(id){
    let index = listings.findIndex(story => story.id ===id);
    if (index !== -1){
        listings.splice(index, 1);
        return true
    }else{
        return false;
    }
}
