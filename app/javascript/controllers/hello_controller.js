import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    dex: Number
  }

  static targets = [
    'display',
    'frame',
    'charts',
    'ramps'
  ]

  connect() {
    this.colorlist;

    this.displayTarget.innerText="connected";

    fetch('/colors')
      .then((response) => response.json())
      .then((data) => (this.colorlist = data));

  }

  allcolors() {
    for(let color of this.colorlist) {
      let hsvlist = this.convert(color);
      this.populateColor(hsvlist);
    }
  }

  convert(color) {
    let hsv = [];

    for(let swatch of color.swatches) {
      let string = swatch;

      let r = parseInt(string.slice(1,3),16);
      let g = parseInt(string.slice(3,5),16);
      let b = parseInt(string.slice(5),16);

      r = (r/255);
      g = (g/255);
      b = (b/255);

      let max = Math.max(r,g,b);
      let min = Math.min(r,g,b);
      let diff = max - min;
      
      let hue;
      switch(max) {
        case min: 
          hue = 0;
          break;
        case parseFloat(r):
          hue = (((g - b)/diff)%6) * 60;
          break;
        case parseFloat(g):
          hue = (((b - r)/diff)+2) * 60;
          break;
        case parseFloat(b):
          hue = (((r - g)/diff)+4) * 60;
          break;
      }

      hue = Math.round(hue);

      let sat;
      if(max == 0) sat = 0;
      else
        sat = Math.floor((diff / max) * 10000) / 100;

      let val = Math.floor(max * 10000) / 100;

      hsv.push({
        hue: hue,
        sat: sat,
        val: val,
        hex: string
      });
    }

    return hsv;
  }

  populateColor(hsv) {

    let frame = document.createElement('div');
    frame.classList.add('frame');
    frame.style.height = '40vh';

    for(let shade of hsv) {

      let cell = document.createElement('div');
      cell.style.backgroundColor = shade.hex;
      
      if(shade.val < 98) {
        cell.style.color='#be123c';
      }
      if(shade.val < 95) {
        cell.style.color='#155e75';
      }
      if(shade.val < 90) {
        cell.style.color='#083344';
      }
      if(shade.val < 80) {
        cell.style.color='#fef08a';
      }
      if(shade.val < 60) {
        cell.style.color='#bfdbfe';
      }
      if(shade.val < 33) {
        cell.style.color = '#f1f5f9';
      }
      cell.classList.add('flex','justify-end','items-center','font-bold','font-inter');

      let p = document.createElement('p');
      p.innerText = `H:${shade.hue} S:${shade.sat} V:${shade.val} ${shade.hex}`;

      cell.appendChild(p);
      frame.appendChild(cell);
    }
    this.frameTarget.appendChild(frame);
  }

  chartAll() {
    for(let i = 0; i < this.colorlist.length; i++) {
      this.chartOne(i);
    }
  }

  chartOne(index) {
    let colorin = this.colorlist[index].swatches;

    let basecolor = this.convertOne(colorin[5]);

    let chart = document.createElement('div');
    chart.classList.add('chartframe');

    let list = [];

    for(let tint of colorin) {
      let shade = this.convertOne(tint);
      list.push({
        hdelta: (shade.hue - basecolor.hue).toFixed(2),
        sdelta: (shade.sat - basecolor.sat).toFixed(2),
        vdelta: (shade.val - basecolor.val).toFixed(2),
        hex: shade.hex
      })
    }
    let i = 0;
    for(let delta of list) {

      let box = document.createElement('div');
      box.classList.add('chartcell');

      let itemh = document.createElement('p');
      itemh.innerText = (delta.hdelta);
      let items = document.createElement('p');
      items.innerText = (delta.sdelta);
      let itemv = document.createElement('p');
      itemv.innerText = (delta.vdelta);
      box.appendChild(itemh);
      box.appendChild(items);
      box.appendChild(itemv);

      box.style.borderWidth = '4px';
      box.style.borderColor = delta.hex;
      if(i == 5) box.classList.add('row-span-2');
      chart.appendChild(box);
      i++;
    }
    this.chartsTarget.appendChild(chart);
    
  }

  convertOne(color) {
    let r = parseInt(color.slice(1,3),16);
    let g = parseInt(color.slice(3,5),16);
    let b = parseInt(color.slice(5),16);

    r = (r/255);
    g = (g/255);
    b = (b/255);

    let max = Math.max(r,g,b);
    let min = Math.min(r,g,b);
    let diff = max - min;
    
    let hue;
    switch(max) {
      case min: 
        hue = 0;
        break;
      case parseFloat(r):
        hue = (((g - b)/diff)%6) * 60;
        break;
      case parseFloat(g):
        hue = (((b - r)/diff)+2) * 60;
        break;
      case parseFloat(b):
        hue = (((r - g)/diff)+4) * 60;
        break;
    }

    hue = Math.round(hue);

    let sat;
    if(max == 0) sat = 0;
    else
      sat = Math.floor((diff / max) * 10000) / 100;

    let val = Math.floor(max * 10000) / 100;

    return {
      hue: hue,
      sat: sat,
      val: val,
      hex: color
    };
  }

  rampOne() {
    let colorin = this.convertOne("#07a7cb");

    let allshades = [];
    for(let c = 0; c<this.colorlist.length; c++) {
      for(let s=0; s<this.colorlist[c].swatches.length; s++) {
        let color = this.convertOne(this.colorlist[c].swatches[s]);
        allshades.push({
          hue: color.hue,
          sat: color.sat,
          val: color.val,
          color: color.hex,
          colordex: c
        });
      };
    };

    let hdiff = 1000;
    let sumdeltaval = 2000;

    let closehue = "#FFFFFF";
    let closesumdelta = "FFFFFF";
    let huedex, satsumdex;

    for(let shade of allshades) {
      let huedifference = this.diffdegrees(shade.hue, colorin.hue);
      if(huedifference < hdiff) {
        hdiff = huedifference;
        closehue = shade.color;
        huedex = shade.colordex;
      }
      
      //use huedifference
      let satdifference = this.difference(shade.sat, colorin.sat);
      let sumdelta = huedifference + satdifference;
      if(sumdeltaval > sumdelta) {
        sumdeltaval = sumdelta;
        closesumdelta = shade.color;
        satsumdex = shade.colordex;
      }
    }

    let chart = document.createElement('div');
    chart.classList.add('grid');

    let cell = document.createElement('div');
    let hcell = document.createElement('p');
    hcell.innerText = `${closehue} ${huedex}`;
    hcell.style.borderColor = closehue;
    hcell.style.backgroundColor = colorin.hex;
    hcell.style.borderWidth = '4px';

    let scell = document.createElement('p');
    scell.innerText = `${closesumdelta} ${satsumdex}`;
    scell.style.borderColor = closesumdelta;
    scell.style.backgroundColor = colorin.hex;
    scell.style.borderWidth = '4px';

    cell.appendChild(hcell);
    cell.appendChild(scell);
    chart.appendChild(cell);
    this.rampsTarget.appendChild(chart);

    this.generateRamp(colorin, huedex);
  }

  diffdegrees(a,b) {
    let straight = Math.abs(Math.max(a,b) - Math.min(a,b));
    let around = 360 - Math.max(a,b) + Math.min(a,b);
    return Math.min(straight,around);
  }

  difference(a,b) {
    return Math.abs(Math.max(a,b) - Math.min(a,b));
  }
  //input //let colorin = this.convertOne("#07a7cb"); 
  generateRamp(colorbase, huedex) {
    

    let twmatch = this.colorlist[huedex].swatches;
    let list = [];

    for(let tint of twmatch) {
      let shade = this.convertOne(tint);
      list.push({
        hdelta: (shade.hue - colorbase.hue).toFixed(2),
        sdelta: (shade.sat - colorbase.sat).toFixed(2),
        vdelta: (shade.val - colorbase.val).toFixed(2)
      })
    }

    let rampout = [];
    for(let deltas of list) {
      rampout.push({
        hue: colorbase.hue + deltas.hdelta,
        sat: colorbase.sat + deltas.sdelta,
        val: colorbase.val + deltas.vdelta
      });
    }
    console.log(rampout);
    return;
  }
  /*
  genHex(list) {
    return list;
  }*/
}
