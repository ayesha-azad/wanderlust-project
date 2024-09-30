mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    })

    const element = document.createElement("div");
    element.className = "marker";

    const marker = new mapboxgl.Marker(element)
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(
                `<h3>${listing.title}</h3><p>${listing.description}</p>`
              )
          )
        .addTo(map);