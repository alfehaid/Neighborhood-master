var map;
var locationDetails;

var initMap = function() {
    map = new google.maps.Map(document.getElementById('MapArea'), {
        center: new google.maps.LatLng(26.359231, 43.981812),
        zoom: 12,
    });

    locationDetails = [{
        loc: new google.maps.LatLng(26.358657808885983, 43.9495157253969),
        title: "Dunkin' Donuts",
        details: '<b>Donut Shop and Coffee Shop.<br><img src="images/DD.jpg" width="200px" height="200px">',
        venues: "4eb94306f790d87d0453c818"
    }, {
        loc: new google.maps.LatLng(26.354235, 43.954085),
        title: "Lion Coffee",
        details: '<b>Coffee Shop.<br><img src="images/LC.jpg" width="200px" height="200px">',
        venues: "572713a4498ee5413a976dad"
    }, {
        loc: new google.maps.LatLng(26.366405, 43.961956),
        title: "Godiva",
        details: '<b>Chocolate Shop and Coffee Shop.<br><img src="images/GD.jpg" width="200px" height="200px">',
        venues: "58b322e2117420784071ac8e"
    }, {
        loc: new google.maps.LatLng(26.400393899750746, 43.91684605898735),
        title: "Gloria Jean's Coffees",
        details: '<b>Gloria Jean\'s Coffees<br><img src="images/CC.jpg" width="200px" height="200px">',
        venues: "56f26493cd1041444ed7b071"
    }, {
        loc: new google.maps.LatLng(26.3581514, 43.9660651),
        title: "Fan.Jan.Café",
        details: '<b>Café and Coffee Shop<br><img src="images/FJ.jpg" width="200px" height="200px">',
        venues: "4ce2e19a69136dcb8b2df2e6"
    }];
    ko.applyBindings(new MVM());
};


function MVM() {
    var temp = [];
    var self = this;
    for(var j = 0; j < locationDetails.length; j++)
        temp.push(new finalMarker(locationDetails[j], self)); //
    self.query = ko.observable('');
    self.markers = ko.observableArray(temp);
    self.fName = ko.observable('');
    self.fRating = ko.observable('');
    self.kill = function() {
        for(var i = 0; i < self.markers()
            .length; i++)
            self.markers()[i].startState();
    };

    self.filteredMarkers = ko.computed(function() {
        var query = self.query()
            .toLowerCase();
        return ko.utils.arrayFilter(self.markers(), function(marker) {
            var title = marker.title.toLowerCase();
            var match = title.indexOf(query) >= 0;
            marker.googleMarker.setVisible(match);
            return match;
        });
    });
    self.selectItem = function(item) {
        item.selected();
    };
}

function finalMarker(marker_info, model) {
    var self = this;
    self.model = model;
    self.title = marker_info.title;
    self.venues = marker_info.venues;
    self.text = ko.observable(marker_info.details);
    self.infowindow = new google.maps.InfoWindow({
        content: self.text()
    });
    self.googleMarker = new google.maps.Marker({
        position: marker_info.loc,
        title: marker_info.title,
        map: map,
        animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(self.googleMarker, 'click', function() {
        self.selected();
        self.toggleBounce(self.googleMarker);
        self.clicked();
    });
    self.selected = function() {
        model.kill();
        self.clicked();
        var foursquareUrl = 'https://api.foursquare.com/v2/venues/' + self.venues + '?v=20170503&' + 'client_id=' + 'LAJFPQ22OSOO4DPJ1BHKACKYCP4SHAMINJIGIWIBM2TUFDWF' + '&client_secret=' + 'SVUJOXFIL0DRNNZDRKAA12SGLZXBQUMXVJPPFJX52A21NHGV';
        $.ajax({
                url: foursquareUrl
            })
            .done(
                function(response) {
                    var coffven = response.response.venue;
                    model.fName(coffven.name);
                    model.fRating(coffven.rating);
                    model.fRating('Rating by foursquare is ' + coffven.rating + ' ');
                });
    };

    self.toggleBounce = function(marker) {
        if(marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    };
    self.matches = function(q) {
        return $.inArray(q.toLowerCase(), self.searchOptions) != -1;
    };
    self.matchesSearch = function() {
        model.kill();
        self.isHidden(false);
        self.googleMarker.setVisible(true);
        self.infowindow.open(map, self.googleMarker);
        self.clicked();
    };
    self.startState = function() {
        self.isHidden(false);
        self.googleMarker.setVisible(true);
        self.infowindow.close();
    };
    self.doNotMatch = function() {
        self.isHidden(true);
        self.googleMarker.setVisible(false);
        self.infowindow.close();
    };
    self.clicked = function() {
        self.isHidden(false);
        self.googleMarker.setVisible(true);
        self.googleMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.googleMarker.setAnimation(null);
        }, 1400);
        self.infowindow.open(map, self.googleMarker);
    };
    self.isHidden = ko.observable(false);
}