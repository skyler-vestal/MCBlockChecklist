let blocks_checks = [];
let items_checks = [];
let blocks;
let items;
let saved;
let count = 1;
let input;
let prevInput;

var blockDone;
var itemDone;

function preload() {
  blocks = loadStrings('resources/blocks.data');
  items = loadStrings('resources/items.data');
  saved = loadStrings('resources/check.data');
}

function setup() {
  createCanvas(300, 100);
  input = createInput();
  input.position(0, 100 - input.height);
  //saveB = createButton('Download Progress');
  //saveB.mousePressed(writeData);
  saved = split(saved[0], ',');
  prevInput = input.value();
  for (i = 0; i < blocks.length; i++) {
    blocks_checks.push(new check_obj(blocks[i],
      'blocks', i));
  }
  for (i = 0; i < items.length; i++) {
    items_checks.push(new check_obj(items[i],
      'items', blocks.length + i));
  }
  initData();

  socket.on('takeCheck', takeCheck);
}

function draw() {
  background(255);
  text('Blocks: ' + blockDone + '/' + blocks_checks.length, 0, 20);
  text('Items: ' + itemDone + '/' + items_checks.length, 0, 40);
  text('Total: ' + (blockDone + itemDone) + '/' +
        (blocks_checks.length + items_checks.length), 0, 60);
  if (input.value() != prevInput) {
    filterChecks(input.value(), blocks_checks);
    filterChecks(input.value(), items_checks);
  }
  prevInput = input.value();
}

function sendCheck(checkObj) {
    var data = {
      num: checkObj.getIndex(),
      val: checkObj.getValue()
    }
    if (data.num < blocks_checks.length) {
      blockDone = data.val ? blockDone + 1 : blockDone - 1;
    } else {
      itemDone = data.val ? itemDone + 1 : itemDone - 1;
    }
    console.log('Sending ' + data.val + ' to ' + data.num + 'th check');
    socket.emit('sendCheck', data);
    writeData();
}

function takeCheck(data) {
  console.log('Received changed: ' + data.num + ' = ' + data.val);
  var boxObj;
  if (data.num < blocks_checks.length) {
    boxObj = blocks_checks[data.num];
    blockDone = data.val ? blockDone + 1 : blockDone - 1;
  } else {
    boxObj = items_checks[data.num - blocks_checks.length];
    itemDone = data.val ? itemDone + 1 : itemDone - 1;
  }
  boxObj.getBox().checked(data.val);
}

function initData() {
  for (i = 0; i < blocks.length; i++) {
    var val = saved[i] == '1' ? true : false;
    blocks_checks[i].getBox().checked(val);
  }
  for (i = 0; i < items.length; i++) {
    var val = saved[blocks.length + i] == '1' ? true : false;
    items_checks[i].getBox().checked(val);
  }
  itemDone = countValues(items_checks);
  blockDone = countValues(blocks_checks);
}

function countValues(data) {
  var num = 0;
  for (i = 0; i < data.length; i++) {
    if (data[i].getValue()) {
      num++;
    }
  }
  return num;
}

function filterChecks(str, list) {
  for (i = 0; i < list.length; i++) {
    if (list[i].getName().toLowerCase().includes(str)) {
      list[i].cBox.show();
    } else {
      list[i].cBox.hide();
    }
  }
}

function writeData() {
  var data = [];
  for (i = 0; i < blocks.length; i++) {
    val = blocks_checks[i].getValue() ? 1 : 0;
    data.push(val);
  }
  for (i = 0; i < items.length; i++) {
    val = items_checks[i].getValue() ? 1 : 0;
    data.push(val);
  }
  socket.emit('saveChecks', data);
}

class check_obj {
  constructor(name_, folder, i) {
    this.name = name_;
    // if (folder == 'blocks') {
    //   this.img = loadImage('resources/' + folder + '/' + this.name + '.png');
    // }
    this.index = i;
    this.cBox = createCheckbox(this.name.replace(/_/g, ' '));
    this.cBox.changed(sendCheck.bind(null, this));
  }

  getValue() {
    return this.cBox.checked();
  }

  getIndex() {
    return this.index;
  }

  getName() {
    return this.name;
  }

  getBox() {
    return this.cBox;
  }
}
