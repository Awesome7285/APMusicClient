// Removes the album name from the location name
function location_to_track_name(location_name) {
    var index = location_name.indexOf(": ")
    return location_name.slice(index + 2)
}

// Location name to bool and requirement list
function locationIsInLogic(location) {
    let requirementString = locations_to_reqs[location];
    
    var [result, requirements] = parse_requirement_string_to_postfix(requirementString);
    if (result.length == 0) {
        return [true, requirements];
    }

    var inLogic = evaluate_postfix_requirements(result, requirements);

    return [inLogic, requirements]; // bool, list
}

const ITEM_REGEX = /(\|[^|]*\|)/g
const DIGITS_REGEX = /[0-9]/
function parse_requirement_string_to_postfix(string) {

    let requirements = string.match(ITEM_REGEX); //requirements = re.findall(ITEM_REGEX, string)
    if (requirements === null) {
        return [[], []];
    }
    for (let i = 0; i < requirements.length; i++) {
        string = string.replace(requirements[i], i.toString());
    }
    string = string.replace(/ and /gi, "&");
    string = string.replace(/ or /gi, "|");
    string = string.replace(/\n/g, "");
    string = string.replace(/ /g, "");
    let stack = [];
    let result = [];
    let skip = [];

    for (let index = 0; index < string.length; index++) {
        if (skip.includes(index)) {
            continue;
        }
        let number = "";
        let character = string[index]
        if (DIGITS_REGEX.test(character.toString())) {
            number += character;
            while (index + 1 < string.length && DIGITS_REGEX.test(string[index + 1])) {
                index++;
                skip.push(index);
                number += string[index];
            }
            result.push(number);
        } else if (character == '(') {
            stack.push('(');
        } else if (character == ')') {
            while (stack[stack.length - 1] != '(') {
                result.push(stack.pop());
            }
            stack.pop();
        } else {
            while (stack.length > 0 && character == '|' && stack[stack.length - 1] == '&') {
                result.push(stack.pop());
            }
            stack.push(character);
        }
    }
    while (stack.length > 0) {
        result.push(stack.pop());
    }
    return [result, requirements];
}

function evaluate_postfix_requirements(postfix, requirements) {
    let stack = [];
    for (i = 0; i < postfix.length; i++) {
        token = postfix[i];
        if (token == '&') {
            var value1 = stack.pop();
            var value2 = stack.pop();
            stack.push(value1 && value2);
        } else if (token == '|') {
            var value1 = stack.pop();
            var value2 = stack.pop();
            stack.push(value1 || value2);
        } else {
            var item = requirements[token]
            item = item.replace(/^\|+|\|+$/g, ''); // Remove |
            let g = item.split(':');
            let num = 1;
            if (g.length == 2) {
                num = g[1];
                item = g[0];
            }
            // console.log(item, num);
            stack.push(document.getElementById(item).className == "charImageObtained" && document.getElementById(item+"-count").textContent >= num)
        }
    }
    return stack.pop();
}
