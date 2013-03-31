$(function () {

  var plotType = $("input[name='plottype']").val();
  // Each key is defined in the 'plottype' radio options
  var plotTypeFunMap = {
    markers : placeCellMarkers,
    cellsite : placeCellSite,
    heat : placeHeatMap
  };

  function placeCellMarkers(cell, res, last) {
    var color = '009900';
    if (cell[0] == "g") {
      color = '990000';
    }
    $('#map').gmap3({
      marker : {
        options : {
          position : [parseFloat(cell[8]), parseFloat(cell[9])],
          flat : true,
          icon : new google.maps.MarkerImage(
            "http://www.googlemapsmarkers.com/v1/" + color,
            null,
            null,
            null,
            new google.maps.Size(8, 10)
            )
        }
      }
    });
  }

  function placeCellSite(cell, res, last) {

    var lat = parseFloat(cell[8]),
    lon = parseFloat(cell[9]),
    bearing = parseFloat(cell[10]),
    opening = (cell[11]),
    range = parseFloat(cell[12]) / 1000;

    $('#map').gmap3({
      polygon : {
        options : {
          strokeColor : "#FF0000",
          strokeOpacity : 0.8,
          strokeWeight : 2,
          fillColor : "#FF0000",
          fillOpacity : 0.35,
          paths : ShapeHelper.createArc(lat, lon, bearing, opening, range)
        }
      }
    });
  }

  function placeHeatMap(cell, res, last) {
    if (res.points === undefined) {
      res.points = [];
    }

    res.points.push(new google.maps.LatLng(parseFloat(cell[8]), parseFloat(cell[9])));

    if (last) {
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data : res.points,
        dissipating : true,
        maxIntensity : 0.5,
        opacity : 0.9
      });
      heatmap.setMap($("#map").gmap3("get"));
    }
  }

  function handleLer(Ler) {}

  function putCellDataOnMap(data, fun) {
    var result = {};
    for (var row in data) {
      if (data[row].length == 1)
        continue;
      var isLast = (row == (data.length - 1));
      fun(data[row], result, isLast);
    }
  }

  function putLerDataOnMap(data) {
    for (var row in data) {
      if (data[row].length == 1)
        continue;
      handleLer(data[row]);
    }
  }

  function handleCellFile(evt) {
    var files = evt.target.files,
    file = files[0],
    dfd = $.Deferred();

    var reader = new FileReader();
    reader.onerror = function (ex) {
      dfd.reject(ex);
    };
    reader.onload = function (ev) {
      if (ev.target.readyState == FileReader.DONE){
        dfd.resolve(event.target.result);
      }
    };

    dfd.done(loadCsv);
    dfd.fail(function(ex) {
      alert(ex.getMessage());
    });

    reader.readAsText(file);
  }

  function loadCsv(csv) {
    var data = $.csv.toArrays(csv);
    putCellDataOnMap(data, plotTypeFunMap[plotType]);
  }

  function handleLerFile(evt) {
    var files = evt.target.files;
    var file = files[0];
  }

  function initMap() {
    $('#map').gmap3({
      map:{
        address:"USA",
        options:{
          zoom: 4
        }
      }
    });
  }

  $('#clear').click(function () {
    $('#map').gmap3('destroy');
    var container = $('#map').parent();
    $('#map').remove();
    container.prepend('<div id="map"></div>');
    initMap();
    var $cells = $('#cells');
    $cells.replaceWith($cells.val('').clone(true));
  });

  $('#cells').change(handleCellFile);
  $('#lers').change(handleLerFile);
  $("input[name='plottype']").change(function () {
    plotType = $(this).val();
  });
  initMap();

  $('#map_side').tabs();
});
