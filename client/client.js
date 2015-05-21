LocalHouse = new Mongo.Collection(null);
var newHouse = {
  name: '',
  plants: [],
  lastsave: 'never',
  status: 'unsaved'
};

Session.setDefault('selectedHouseId','');

Tracker.autorun(function(){
  console.log("The selected ID is: " + Session.get("selectedHouse"));
});



Template.selectHouse.helpers({
  houseNameId: function(){
    return HousesCollection.find({},{fields: {name: 1,_id: 1}});
  },
  isSelected: function(){
    return Session.equals('selectedHouse',this._id)? 'selected' : '';
  }
});

Template.selectHouse.events = {
  'change #selectHouse': function(evt){
    var selectedId = evt.currentTarget.value;
    var newID = LocalHouse.upsert(
      selectedId,
      HousesCollection.findOne(selectedId) || newHouse
      ).insertedId;  //insertedId is returned
    Session.set("selectedHouseId",newID);
  }
};

Template.registerHelper('selectedHouse',function(){
  return LocalHouse.findOne(Session.get('selectedHouseId'))
});

// Template.showHouse.helpers({
//   house: function(){
//     return HousesCollection.findOne({_id: Session.get("selectedHouse")});
//   }
// });

Template.registerHelper('withIndex',function(list){
  var withIndex = _.map(list,function(v,i){
    if(v === null) return;
    v.index = i;
    return v;
  });
  return withIndex;
});

Template.plantDetails.events({
  'click button.water': function(evt){
    var lastvisit = new Date();
    var plantId = $(evt.currentTarget).attr('data-id');
    Session.set(plantId,true);
    HousesCollection.update({_id:Session.get("selectedHouse")},
      {$set:{lastvisit: lastvisit}});
  }
});

Template.plantDetails.helpers({
  isWatered: function(){
    var plantId = Session.get("selectedHouse")+"-"+this.color;
    return Session.get(plantId)? 'disabled' : '';
  }
});



Template.houseForm.events({
  'click button.addPlant': function(evt){
    evt.preventDefault();
    var newPlant = {color: '',instructions: ''};
    var modifier = {$push: {'plants': newPlant}};
    updateLocalHouse(Session.get('selectedHouseId'),modifier);
  },
  'keyup input#house-name': function(evt){
    evt.preventDefault();
    var modifier = {$set: {'name': evt.currentTarget.value}};
    updateLocalHouse(Session.get('selectedHouseId'),modifier);
  },
  'click button#saveHouse': function(evt){
    evt.preventDefault();
    var id = Session.get('selectedHouseId');
    var modifier = {$set: {'lastsave': new Date()}};
    updateLocalHouse(id,modifier);
    HousesCollection.upsert(
      {_id: id},
      LocalHouse.findOne(id)
    );
  }
});


Template.showHouse.events({
  'click button#delete': function(evt){
    var house = this;
    var deleteConfirmation = confirm("Are you sure?");
    if (deleteConfirmation){
      HousesCollection.remove(house._id);
    }
  }
});


updateLocalHouse = function (id,modifier){
  LocalHouse.update(
    {
      '_id': id,
    },
    modifier
  );
};
