import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../../core/base/base.component';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent extends BaseComponent {
  constructor() {
    super();
  }

  private router = inject(Router);

  navToDetail(id: string | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  @ViewChild('auctionScroll', { static: false })
  auctionScroll!: ElementRef;

  selectedCity = 'Hà Nội';
  selectedCategory = 'Loại BĐS';
  keyword = '';
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  auctionList: AuctionItem[] = [
    {
      id: 'dgts_moj',
      title: 'Đất Thanh Oai 500m²',
      type: 'Quyền sử dụng đất',
      location: 'Hà Nội',
      price: 11.5,
      owner: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Mở đăng ký'
    },
    {
      id: 'dgts_moj1',
      title: 'Đất Thanh Oai 500m²',
      type: 'Quyền sử dụng đất',
      location: 'Hà Nội',
      price: 11.5,
      owner: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Mở đăng ký'
    },
    {
      id: 'dgts_moj2',
      title: 'Đất Thanh Oai 500m²',
      type: 'Quyền sử dụng đất',
      location: 'Hà Nội',
      price: 11.5,
      owner: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Mở đăng ký'
    },
    {
      id: 'dgts_moj3',
      title: 'Đất Thanh Oai 500m²',
      type: 'Quyền sử dụng đất',
      location: 'Hà Nội',
      price: 11.5,
      owner: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Mở đăng ký'
    }
  ];

  featuredAreas = [
    {
      name: 'Hà Nội',
      sessions: 45,
      value: '1.250 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    },
    {
      name: 'TP Hồ Chí Minh',
      sessions: 30,
      value: '980 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    },
    {
      name: 'Đà Nẵng',
      sessions: 18,
      value: '520 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    },
    {
      name: 'Bình Dương',
      sessions: 22,
      value: '610 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    }
  ];

  categories = [
    { icon: 'fa-landmark', name: 'Quyền sử dụng đất' },
    { icon: 'fa-house', name: 'Nhà riêng lẻ' },
    { icon: 'fa-building', name: 'Căn hộ' },
    { icon: 'fa-map', name: 'Đất dự án' },
    { icon: 'fa-city', name: 'Tài sản công' },
    { icon: 'fa-scale-balanced', name: 'Thi hành án' }
  ];

  endedAuctions = [
    {
      id: 'dgts_moj8',
      title: 'Đất Thanh Oai 500m²',
      location: 'Hà Nội',
      price: '11.50 tỷ',
      increase: '+28%',
      startPrice: '9.00 tỷ',
      company: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Đã kết thúc'
    },
    {
      id: 'dgts_moj7',
      title: 'Đất Thanh Oai 500m²',
      location: 'Hà Nội',
      price: '11.50 tỷ',
      increase: '+28%',
      startPrice: '9.00 tỷ',
      company: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Đã kết thúc'
    },
    {
      id: 'dgts_moj6',
      title: 'Đất Thanh Oai 500m²',
      location: 'Hà Nội',
      price: '11.50 tỷ',
      increase: '+28%',
      startPrice: '9.00 tỷ',
      company: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Đã kết thúc'
    },
    {
      id: 'dgts_moj5',
      title: 'Đất Thanh Oai 500m²',
      location: 'Hà Nội',
      price: '11.50 tỷ',
      increase: '+28%',
      startPrice: '9.00 tỷ',
      company: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Đã kết thúc'
    },
    {
      id: 'dgts_moj4',
      title: 'Đất Thanh Oai 500m²',
      location: 'Hà Nội',
      price: '11.50 tỷ',
      increase: '+28%',
      startPrice: '9.00 tỷ',
      company: 'Lạc Việt',
      image: 'assets/images/product-sample-1.jpg',
      status: 'Đã kết thúc'
    },
  ];

  tools = [
    {
      title: 'Định giá tài sản đấu giá',
      desc: 'Ước tính giá trị tài sản trước khi tham gia đấu giá dựa trên dữ liệu thị trường',
      image: 'assets/images/dinh-gia-ts.png',
      icon: 'fa-calculator'
    },
    {
      title: 'Hỗ trợ vay vốn khi trúng đấu giá',
      desc: 'Lãi suất ưu đãi từ đối tác ngân hàng. Giải ngân nhanh - Thủ tục đơn giản',
      image: 'assets/images/cong-cu-vay-von.png',
      icon: 'fa-university'
    },
    {
      title: 'Tư vấn pháp lý đấu giá',
      desc: 'Tra cứu quy định, điều kiện tham gia và quy trình đấu giá tài sản',
      image: 'assets/images/tu-van-phap-ly.png',
      icon: 'fa-balance-scale'
    }
  ];

  news = [
    {
      title: 'Quy định mới về đấu giá tài sản có hiệu lực',
      image: 'assets/images/tin1.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin2.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin3.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin4.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin5.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin6.jpg'
    }
  ];

  onSearch() {
    // TODO: hook vào router / service tìm kiếm tài sản đấu giá
    console.log({
      keyword: this.keyword,
      city: this.selectedCity,
      category: this.selectedCategory,
    });
    this.router.navigate(['/products-listing']);
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.pageX;
    this.scrollLeft = this.auctionScroll.nativeElement.scrollLeft;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;

    const x = e.pageX;
    const walk = x - this.startX;

    this.auctionScroll.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  onMouseUp() {
    this.isDragging = false;
  }
}
interface AuctionItem {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  owner: string;
  image: string;
  status: string;
}