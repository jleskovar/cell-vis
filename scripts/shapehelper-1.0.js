var ShapeHelper = (function () {

  function destinationPoint(lat, lng, range, bearing) {
    var R = 6371, // radius of earth
        d = parseFloat(range) / R, // d = angular distance covered on earth’s surface
        lat1 = lat.toRad(),
        lon1 = lng.toRad();

        bearing = bearing.toRad();

        var dLat = d * Math.cos(bearing);

    // nasty kludge to overcome ill-conditioned results around parallels of latitude:
    if (Math.abs(dLat) < 1e-10) {
      dLat = 0; // dLat < 1 mm
    }

    var lat2 = lat1 + dLat;
    var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
    var q = (isFinite(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1); // E-W line gives dPhi=0
    var dLon = d * Math.sin(bearing) / q;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(lat2) > Math.PI / 2) {
      lat2 = lat2 > 0 ? Math.PI - lat2 : -Math.PI - lat2;
    }

    lon2 = (lon1 + dLon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

    return [lat2.toDeg(), lon2.toDeg()];
  }

  var mod = {};

  if (typeof(Number.prototype.toRad) == 'undefined') {
    Number.prototype.toRad = function () {
      return this * Math.PI / 180;
    };
  }

  if (typeof Number.prototype.toDeg == 'undefined') {
    Number.prototype.toDeg = function () {
      return this * 180 / Math.PI;
    };
  }

  function createArc(lat, lng, bearing, opening, range) {
    var i, steps, paths;

    paths = [[lat, lng]];
    steps = 5;

    for (i = 2; i <= steps; ++i) {
      paths.push(destinationPoint(lat, lng, range, bearing - (opening / i)));
    }

    paths.push(destinationPoint(lat, lng, range, bearing));

    for (i = steps; i >= 2; --i) {
      paths.push(destinationPoint(lat, lng, range, bearing + (opening / i)));
    }

    paths.push([lat, lng]);

    return paths;
  }

  mod.createArc = createArc;

  return mod;

}());
