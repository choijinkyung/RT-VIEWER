let convexhull = new function() {

    // Returns a new array of points representing the convex hull of
    // the given set of points. The convex hull excludes collinear points.
    // This algorithm runs in O(n log n) time.
    this.makeHull = function(points) {
        var newPoints = points.slice();
        newPoints.sort(this.POINT_COMPARATOR);
        return this.makeHullPresorted(newPoints);
    };

    // Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
    this.makeHullPresorted = function(points) {
        if (points.length <= 1)
            return points.slice();

        // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
        // as per the mathematical convention, instead of "down" as per the computer
        // graphics convention. This doesn't affect the correctness of the result.

        let upperHull = [];
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            while (upperHull.length >= 2) {
                let q = upperHull[upperHull.length - 1];
                let r = upperHull[upperHull.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                    upperHull.pop();
                else
                    break;
            }
            upperHull.push(p);
        }
        upperHull.pop();

        let lowerHull = [];
        for (let i = points.length - 1; i >= 0; i--) {
            let p = points[i];
            while (lowerHull.length >= 2) {
                let q = lowerHull[lowerHull.length - 1];
                let r = lowerHull[lowerHull.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                    lowerHull.pop();
                else
                    break;
            }
            lowerHull.push(p);
        }
        lowerHull.pop();

        if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y)
            return upperHull;
        else
            return upperHull.concat(lowerHull);
    };


    this.POINT_COMPARATOR = function(a, b) {
        if (a.x < b.x)
            return -1;
        else if (a.x > b.x)
            return +1;
        else if (a.y < b.y)
            return -1;
        else if (a.y > b.y)
            return +1;
        else
            return 0;
    };

};
