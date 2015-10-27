function Arrow(place, config, callback) {
	this.config = {
		id: 'arrow' + (new Date()).getTime() + 'r' + (Math.random() * 1000 | 0), // Generate an unique id for the arrow.
		points: [], // The point array for the arrow line.
		showTip: true, // Toggle for arrow tip visibility.
		smoothRadius: 150, // The smoothening radius for point selection.
		offsetX: 25, // Horizontal padding (in pixels) around the plot.
		offsetY: 25  // Vertical padding  (in pixels) around the plot.
	}
	
	this.initialize(place, config, callback);
}

Arrow.prototype.initialize = function(place, config, callback) {
	
	this.place = place;
	for (var item in config) this.config[item] = config[item];
	if (typeof(callback) === 'function') callback();
	
	this.draw();
}

Arrow.prototype.addPoint = function(x, y) {
	this.config.points.push({x: x, y: y});
	this.draw();
}

Arrow.prototype.selectPoints = function() {
	var result = [];
	var prevX = 0, prevY = 0;
	for (var i = 0; i < this.config.points.length; ++i) {
		var current = this.config.points[i];
		
		if (
			(i === 0) ||
			(i === this.config.points.length - 1) ||
			(Math.pow(current.x - prevX, 2) + Math.pow(current.y - prevY, 2) > Math.pow(this.config.smoothRadius, 2))
		) {
			prevX = current.x;
			prevY = current.y;
			result.push(current);
		}
	}
	return result;
}

Arrow.prototype.draw = function() {
	
	// Select the points that will be drawn.
	var points = this.selectPoints();
	
	if (points.length >= 2) {
		
		// Calculate the area of the svg.
		var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
		
		for (var item in points) {
			var current = points[item];
			minX = Math.min(minX, current.x);
			minY = Math.min(minY, current.y);
			maxX = Math.max(maxX, current.x);
			maxY = Math.max(maxY, current.y);
		}
		
		// Direction vector length multiplier.
		var mul = 0.2;
	
		var first = points[0];
		//this.place.empty();
		
		// Initialize the svg, graphic and path elements with the calculated minimum size and location.
		var s = '<svg id="' + this.config.id + '" style="left: ' + (minX) + 'px; top: ' + (minY) + '" width="' + (maxX - minX + 2 * this.config.offsetX) + '" height="' + (maxY - minY + 2 * this.config.offsetY) + '" class="arrow">' + 
			'<defs>' +
			'<marker id="markerArrow" markerWidth="10" markerHeight="10" refx="5" refy="5" orient="auto">' +
			'<path fill="none" d="M1,1 L5,5 L1,9" />' +
			'</marker>' +
			'</defs><g fill="none">';
		
		s += '<path class="line"' + (this.config.showTip === true ? ' style="marker-end: url(#markerArrow);"' : '');
		
		for (var i = 0; i < points.length - 1; ++i) {
			
			// The ratio between the lengths of the current and the previous segments.
			var len1 = i === 0 ? 1 : Math.sqrt(Math.pow(points[i + 1].x - points[i].x, 2) + Math.pow(points[i + 1].y - points[i].y, 2)) / Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2));
			
			// The first direction vector.
			var v1x = (i < 1) || (i + 1 >= points.length) ? 0 : (points[i + 1].x - points[i - 1].x) * mul * len1;
			var v1y = (i < 1) || (i + 1 >= points.length) ? 0 : (points[i + 1].y - points[i - 1].y) * mul * len1;
			
			// The second direction vector.
			var v2x = i >= points.length - 2 ? 0 : (points[i].x - points[i + 2].x) * mul * len1;
			var v2y = i >= points.length - 2 ? 0 : (points[i].y - points[i + 2].y) * mul * len1;
			
			// The first coordinate starts the line.
			if (i === 0) s += 'd="M' + (points[i].x - minX + this.config.offsetX)           + ',' + (points[i].y - minY + this.config.offsetY);
			
			// All of the intervals contribute one segment to the curve.
			s +=
				' C'   + (points[i].x + v1x - minX + this.config.offsetX)     + ',' + (points[i].y + v1y - minY + this.config.offsetY) +
				' '    + (points[i + 1].x + v2x - minX + this.config.offsetX) + ',' + (points[i + 1].y + v2y - minY + this.config.offsetY) + 
				' '    + (points[i + 1].x - minX + this.config.offsetX)       + ',' + (points[i + 1].y - minY + this.config.offsetY);
		}
		
		// Close the path, graphic and the svg.
		s += '" /></g></svg>';
		
		// Remove the old curve (if any), and append the new curve to the location.
		this.place.find('svg#' + this.config.id).remove()
		this.place.append(s);
	}
}