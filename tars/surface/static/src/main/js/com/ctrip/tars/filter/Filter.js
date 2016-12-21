var filters = angular.module('filters', []).filter('short', function() {
  return function(input) {
    if (!input) {
      return "";
    } else if (input.length > 12) {
      return input.substring(0, 9) + "...";
    } else {
      return input;
    }
  };
}).filter('short2', function() {
  return function(input) {
    if (!input) {
      return "";
    } else {
      input = input.substring(input.lastIndexOf(".") + 1, input.length);
      if (input.length > 12) {
        return input.substring(0, 9) + "...";
      } else {
        return input;
      }
    }
  };
});
/*
var filters = angular.module('filters', []).filter('bigNumber', function() {
	return function(input) {
		if (isNaN(input)) {
			return input;
		} else if (!input) {
			return 0;
		} else {

			if (Math.abs(input) > 1000000000000) {
				return (input / 1000000000000).toFixed(2) + ' T';
			} else if (Math.abs(input) > 1000000000) {
				return (input / 1000000000).toFixed(2) + ' B';
			} else if (Math.abs(input) > 1000000) {
				return (input / 1000000).toFixed(2) + ' M';
			} else if (Math.abs(input) > 1000) {
				return (input / 1000).toFixed(2) + ' K';
			} else {
				return input;
			}
		}
	};
}).filter('littleNumber', function() {
	return function(input) {
		if (isNaN(input)) {
			return 0;
		} else if (!input) {
			return 0;
		} else if (input == Number.MAX_VALUE) {
			return 'MAX';
		} else if (input == Number.MIN_VALUE) {
			return 'MIN';
		} else {
			return roundN(input, 5);
		}
	};
}).filter('ercn', function() {
	return ercn;
}).filter('bigPercent', function() {
	return function(input) {
		if (isNaN(input)) {
			return input;
		} else if (!input) {
			return "0%";
		} else {
			if (input > 1000) {
				return 'MAX';
			} else if (input < -1000) {
				return 'MIN';
			} else {
				return (input * 100).toFixed(2) + ' %';
			}
		}
	};
}).filter('stripscript', function() {
	return function(input) {
		if (!input) {
			return "";
		} else {
			return stripscript(input);
		}
	};
}).filter('startFrom', function() {
	return function(input, start) {
		if (!input) {
			return {};
		}
		return input.slice(start);
	};
}).filter('array', function() {
  return function(items) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
   return filtered;
  };
});
*/

