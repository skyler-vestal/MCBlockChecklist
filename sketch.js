let blocks_checks = [];
let items_checks = [];
let blocks;
let items;
let saved;
let count = 1;
let input;
let prevInput;

function preload() {
  blocks = loadStrings('resources/blocks.data');
  items = loadStrings('resources/items.data');
  saved = loadStrings('resources/saved.data');
}

function setup() {
  createCanvas(0, 0);
  input = createInput();
  saveB = createButton('Download Progress');
  saveB.mousePressed(writeData);
  prevInput = input.value();
  for (i = 0; i < blocks.length; i++) {
    blocks_checks.push(new check_obj(1, 1, blocks[i],
      'blocks', i));
  }
  for (i = 0; i < items.length; i++) {
    blocks_checks.push(new check_obj(1, 1, items[i],
      'items', blocks.length + i));
  }
}

function draw() {
  let min = millis() / 1000 / 60;
  if (min > 20 * count) {
    count++;
    print('Saving data after ' + min + 'th minute.');
    writeData();
  }
  if (input.value() != prevInput) {
    filterChecks(input.value(), blocks_checks);
    filterChecks(input.value(), items_checks);
  }
  prevInput = input.value();
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
  let writer = createWriter('saved_' + day() + '-' + hour()
        + '-' + minute() + '.data');
  for (i = 0; i < blocks.length; i++) {
    val = blocks_checks[i].getValue() ? 1 : 0;
    writer.write(val + '\n');
  }
  for (i = 0; i < items.length; i++) {
    val = blocks_checks[i].getValue() ? 1 : 0;
    writer.write(val + '\n');
  }
  writer.close();
}

class check_obj {
  constructor(x_, y_, name_, folder, i) {
    this.x = x_;
    this.y = y_;
    this.name = name_;
    if (folder == 'blocks') {
      this.img = loadImage('resources/' + folder + '/' + this.name + '.png');
    }
    let val = saved[i] == '1' ? true : false;
    this.cBox = createCheckbox(this.name.replace(/_/g, ' '), val);
  }

  getValue() {
    return this.cBox.checked();
  }

  getName() {
    return this.name;
  }
}
