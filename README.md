# Auction Platform

Nền tảng đấu giá trực tuyến xây dựng trên Angular 19 theo Feature-Based Architecture.

## Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Angular | 19.x | Framework chính |
| NgRx Store | 19.x | State management |
| RxJS | 7.8.x | Reactive programming |
| ngx-toastr | 19.x | Notification |
| moment.js | 2.30.x | Xử lý ngày giờ |

## Cấu Trúc Dự Án

```
src/app/
├── core/                        # Singleton — chỉ khởi tạo 1 lần
│   ├── base/
│   │   ├── base.component.ts    # Abstract class cho tất cả components
│   │   └── service-locator.ts   # DI helper cho guard/interceptor
│   ├── guards/
│   │   └── auth.guard.ts        # Bảo vệ routes yêu cầu đăng nhập
│   ├── interceptors/
│   │   └── auth.interceptor.ts  # Tự động gắn Bearer token vào mọi request
│   └── services/
│       ├── startup.service.ts   # Khởi tạo session khi app load
│       ├── logger.service.ts    # Wrapper ngx-toastr (info/success/error/warn)
│       └── console.service.ts   # Debug logger có màu sắc
│
├── shared/                      # Dùng chung giữa các feature
│   ├── components/
│   │   ├── header/
│   │   └── footer/
│   ├── models/
│   │   └── api-response.model.ts
│   └── utils/
│       └── date.utils.ts        # Helpers xử lý ngày giờ (VN timezone)
│
├── store/                       # NgRx global state
│   ├── app-state.ts             # Root reducers + selectors
│   ├── session/                 # Auth token state
│   │   ├── session.action.ts
│   │   ├── session.reducer.ts
│   │   └── session.state.ts
│   └── user/                    # Current user state
│       ├── user.action.ts
│       ├── user.reducer.ts
│       └── user.state.ts
│
├── features/                    # Tách theo domain (lazy loaded)
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── models/auth.model.ts
│   │   ├── services/auth.service.ts
│   │   └── pages/login/
│   └── home/
│       ├── home.routes.ts
│       └── pages/home/
│
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Bắt Đầu

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm start
```

Mở trình duyệt tại `http://localhost:4200/`.

### Build

```bash
# Development
npm run build:dev

# Production
npm run build:prod
```

## Path Aliases

Dự án cấu hình sẵn path aliases trong `tsconfig.json`:

```typescript
import { BaseComponent } from '@core/base/base.component';
import { LoggerService }  from '@core/services/logger.service';
import { AppStates }      from '@store/app-state';
import { HeaderComponent } from '@shared/components/header/header.component';
import { environment }    from '@env/environment';
```

| Alias | Trỏ đến |
|---|---|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@store/*` | `src/app/store/*` |
| `@features/*` | `src/app/features/*` |
| `@env/*` | `src/environments/*` |

## Thêm Feature Mới

1. Tạo thư mục `src/app/features/<tên-feature>/`
2. Tạo `<tên-feature>.routes.ts` với `export const FEATURE_ROUTES`
3. Đăng ký lazy load trong `app.routes.ts`:

```typescript
{
  path: 'ten-feature',
  loadChildren: () =>
    import('./features/ten-feature/ten-feature.routes')
      .then(m => m.FEATURE_ROUTES),
}
```

4. Tạo `pages/`, `services/`, `models/` bên trong feature

## Environments

| File | Môi trường | API URL |
|---|---|---|
| `environment.ts` | Production (default) | `https://api.auction-platform.com/api` |
| `environment.development.ts` | Development | `http://localhost:3000/api` |
| `environment.production.ts` | Production | `https://api.auction-platform.com/api` |

Thay đổi `apiUrl` trong `environment.development.ts` để trỏ về server local của bạn.

## SCSS

Toàn bộ design tokens tập trung tại `src/assets/styles/_variables.scss`.
Để thay đổi màu chủ đạo của toàn app:

```scss
// src/assets/styles/_variables.scss
$primary:   #2563EB;  // ← đổi dòng này
$secondary: #7C3AED;  // ← hoặc dòng này
```

Các CSS Custom Properties được expose ra `:root` và có thể dùng trực tiếp trong bất kỳ component nào:

```scss
.my-button {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}
```

## Docker

```bash
# Build image
docker build -t auction-platform .

# Run container
docker run -p 80:80 auction-platform
```
