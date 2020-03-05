import { NgModule } from '@angular/core';
import { EcoNewsComponent } from './eco-news.component';
import { CreateNewsComponent } from './create-news/create-news.component';
import { FilterNewsComponent } from './filter-news/filter-news.component';
import { ChangeViewButtonComponent } from './news-list/change-view-button/change-view-button.component';
import { NewsListGalleryViewComponent } from './news-list/news-list-gallery-view/news-list-gallery-view.component';
import { NewsListListViewComponent } from './news-list/news-list-list-view/news-list-list-view.component';
import { NewsListComponent } from './news-list/news-list.component';
import { RemainingCountComponent } from './remaining-count/remaining-count.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FilterEcoNewsPipe } from 'src/app/pipe/filter-ecoNews-pipe/filter-eco-news.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { EcoNewsRoutingModule } from './eco-news-routing.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
    declarations: [
        EcoNewsComponent,
        RemainingCountComponent,
        NewsListComponent,
        NewsListListViewComponent,
        NewsListGalleryViewComponent,
        ChangeViewButtonComponent,
        FilterNewsComponent,
        CreateNewsComponent,
        FilterEcoNewsPipe,
        // FooterComponent
    ],
    imports: [
        CommonModule,
        InfiniteScrollModule,
        EcoNewsRoutingModule,
        SharedModule
    ],
    providers: [

    ]
})
export class EcoNewsModule { }
