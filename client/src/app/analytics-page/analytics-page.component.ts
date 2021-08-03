import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {AnalyticsPage} from "../shared/interfaces";
import {Chart, ChartType, registerables} from "chart.js";
import {Subscription} from "rxjs";

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;
  aSub: Subscription;
  averageCheck: number; //will be received from BE
  pending = true;

  constructor(private service: AnalyticsService) {
  }

  ngAfterViewInit() {
    const gainConfig: any = {
      label: "Revenue",
      color: 'rgb(255, 99, 132)'
    }

    const orderConfig: any = {
      label: "Orders",
      color: 'rgb(54, 162, 235)'
    }

    this.aSub = this.service.getAnalytics().subscribe((data: AnalyticsPage) => {
      this.averageCheck = data.avgCheck;

      gainConfig.labels = data.chart.map(item => item.label); //return array of dates
      gainConfig.data = data.chart.map(item => item.gain); //return array of gains per day

      // Gain - test
      // gainConfig.labels.push('31.07.2021');
      // gainConfig.labels.push('01.08.2021');
      // gainConfig.data.push(50)
      // gainConfig.data.push(40)

      orderConfig.labels = data.chart.map(item => item.label); //return array of dates
      orderConfig.data = data.chart.map(item => item.order); //return array of orders per day

      // Order -test
      // orderConfig.labels.push('31.07.2021');
      // orderConfig.labels.push('01.08.2021');
      // orderConfig.data.push(2)
      // orderConfig.data.push(6)

      const gainCtx = this.gainRef.nativeElement.getContext('2d');
      const orderCtx = this.orderRef.nativeElement.getContext('2d');
      gainCtx.canvas.height = '300px';
      orderCtx.canvas.height = '300px';

      new Chart(gainCtx, createChartConfig(gainConfig));
      new Chart(orderCtx, createChartConfig(orderConfig));

      this.pending = false;
    })
  }

  ngOnDestroy() {
    if(this.aSub) {
      this.aSub.unsubscribe();
    }
  }

}

// for chart.js
function createChartConfig({labels, color, data, label}) {
  return {
    type: 'line' as ChartType,
    options: {
      responsive: true,
    },
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          steppedLine: false,
          fill: false,
          tension: 0.4
        }
      ]
    }
  }
}
