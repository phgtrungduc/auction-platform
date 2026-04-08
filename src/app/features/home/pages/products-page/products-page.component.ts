import { Component, inject, OnInit } from '@angular/core';
import { FilterSidebarComponent } from '@shared/components/filter-sidebar/filter-sidebar.component';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryItem } from '@shared/components/header/header.component';
import { CustomSelectComponent } from '@shared/components/custom-select/custom-select.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { CategoryDropdownComponent } from '@shared/components/category-dropdown/category-dropdown.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, CustomSelectComponent, DatePickerComponent, CategoryDropdownComponent, PaginationComponent],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedCategory: string | null = null;

  optionsStatus = [
    { label: 'Mở đăng ký', value: 1 },
    { label: 'Đang diễn ra', value: 2 },
    { label: 'Sắp diễn ra', value: 3 },
    { label: 'Đã kết thúc', value: 4 }
  ];

  optionsLocation = [
    { label: 'Thành phố Hà Nội', value: 1 },
    { label: 'Thành phố Hồ Chí Minh', value: 2 },
    { label: 'Thành phố Đà Nẵng', value: 3 },
    { label: 'Thành phố Hải Phòng', value: 4 }
  ];

  optionsOrder = [
    { label: 'Mới nhất', value: 1 },
    { label: 'Giá tăng dần', value: 2 },
    { label: 'Giá giảm dần', value: 3 },
  ];

  selectedStatusValue: number | null = null;

  selectedLocationValue: number | null = null;

  selectedOrderValue: number | null = null;

  selectedToDate: Date | null = null;

  selectedFromDate: Date | null = null;

  currentPage: number = 1;
  totalPages: number = 100;

  isAdvancedFilterOpen = false;

  hasLoggedIn = true;

  toggleAdvancedFilter() {
    this.isAdvancedFilterOpen = !this.isAdvancedFilterOpen;
  }

  closeAdvancedFilter() {
    this.isAdvancedFilterOpen = false;
  }

  onPageChange(page: number) {
    console.log('Page changed to:', page);
    this.currentPage = page;
    this.products = [];
    // Call API here to fetch new page data if needed
  }

  onChangeStatus(value: any) {
    console.log('Selected:', value);
  }

  onChangeLocation(value: any) {
    console.log('Selected:', value);
  }

  onChangeOrder(value: any) {
    console.log('Selected:', value);
  }

  onChangeToDate(value: any) {
    console.log('Selected:', value);
  }

  onChangeFromDate(value: any) {
    console.log('Selected:', value);
  }

  categories: CategoryItem[] = [
    {
      label: 'Bất động sản',
      children: [
        { label: 'Đất ở' },
        { label: 'Đất nông nghiệp' },
        { label: 'Nhà phố' },
        { label: 'Căn hộ' },
        { label: 'Nhà xưởng' },
        { label: 'Shophouse' },
      ]
    },
    {
      label: 'Xe cộ',
      children: [
        { label: 'Ô tô' },
        { label: 'Xe tải' },
        { label: 'Xe máy' }
      ]
    },
    {
      label: 'Máy móc',
      children: [
        { label: 'Máy công trình' },
        { label: 'Máy nông nghiệp' },
        { label: 'Dây chuyền' },
      ]
    },
    {
      label: 'Hàng hóa',
      children: [
        { label: 'Gạch/vật liệu' },
        { label: 'Sắt thép' },
        { label: 'Hàng tồn kho' },
      ]
    },
    {
      label: 'Đồ dùng',
      children: [
        { label: 'Nội thất' },
        { label: 'Thiết bị' },
        { label: 'Công vụ' },
      ]
    }
  ];


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || null;
    });
  }

  navToDetail(id: number | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  products = [
    {
      id: 1,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg',
    },
    {
      id: 2,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ (Fail)',
      status: 'Đã kết thúc',
      startPrice: '9.00 tỷ',
      outcomeStatus: 'FAIL',
      image: 'assets/images/product-sample-1.jpg'
    },

    // 👉 Ads chen vào
    { isAd: true },

    {
      id: 3,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Sắp diễn ra',
      image: 'assets/images/product-sample-1.jpg'
    },
    // 👉 Ads thứ 2
    { isAd: true },
    {
      id: 4,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đang diễn ra',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 5,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 6,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 7,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đã kết thúc',
      outcomeStatus: 'SUCCESS',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 8,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đã kết thúc',
      outcomeStatus: 'SUCCESS',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 9,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đã kết thúc',
      outcomeStatus: 'SUCCESS',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 10,
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đã kết thúc',
      outcomeStatus: 'SUCCESS',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    }
  ];

  getStatusClass(status: any): string {
    switch (status) {
      case 'Mở đăng ký':
        return 'badge--green';
      case 'Đang diễn ra':
        return 'badge--blue';
      case 'Sắp diễn ra':
        return 'badge--yellow';
      case 'Đã kết thúc':
        return 'badge--gray';
      default:
        return '';
    }
  }

}
