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
    Session.set("selectedHouse",evt.currentTarget.value);
  }
};

Template.showHouse.helpers({
  house: function(){
    return HousesCollection.findOne({_id: Session.get("selectedHouse")});
  }
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
  'click button#saveHouse': function(evt){
    evt.preventDefault();
    var houseName = $("input[id=house-name]").val();
    var plantColor = $("input[id=plant-color]").val();    
    var plantInstructions = $("input[id=plant-instructions]").val();
    Session.set("selectedHouse",HousesCollection.insert({
      name: houseName,
      plants: [{color: plantColor,instructions: plantInstructions}]
    }));
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