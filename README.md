# RoyalTick — Online Store of Watches

[![Pipeline Status](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/badges/main/pipeline.svg)](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/-/pipelines)
[![Coverage](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/badges/main/coverage.svg)](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/-/jobs)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ViktorMinaylenko_RoyalTick&metric=alert_status)](https://sonarcloud.io/summary/ViktorMinaylenko_RoyalTick)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ViktorMinaylenko_RoyalTick&metric=security_rating)](https://sonarcloud.io/summary/ViktorMinaylenko_RoyalTick)
[![Duplications](https://sonarcloud.io/api/project_badges/measure?project=ViktorMinaylenko_RoyalTick&metric=duplicated_lines_density)](https://sonarcloud.io/summary/ViktorMinaylenko_RoyalTick)

## 🔗 Посилання

| | Посилання |
|---|---|
| 🌐 Shop | [royal-tick-mu.vercel.app](https://royal-tick-mu.vercel.app) |
| 🛠 Admin | [royal-tick-admin.vercel.app](https://royal-tick-admin.vercel.app) |
| 📦 GitLab | [git.ztu.edu.ua/RoyalTick](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick) |
| 🐙 GitHub Mirror | [ViktorMinaylenko/RoyalTick](https://github.com/ViktorMinaylenko/RoyalTick) |
| 🔄 Pipelines | [CI/CD Pipelines](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/-/pipelines) |
| ✅ Latest Pipeline | [Pipeline #4860](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/-/pipelines/4860) |
| 🧪 Jobs | [CI/CD Jobs](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/-/jobs) |
| 📊 Artifacts | [Pipeline Artifacts](https://git.ztu.edu.ua/ipz/2022-2026/ipz-22-4/minaylenko-viktor/RoyalTick/-/artifacts) |
| 📊 SonarCloud | [RoyalTick Analysis](https://sonarcloud.io/project/overview?id=ViktorMinaylenko_RoyalTick) |
| 📡 Uptime Status | [stats.uptimerobot.com](https://stats.uptimerobot.com/8WRsFVy9Rc) |

Повнофункціональний інтернет-магазин годинників з адмін-панеллю, автентифікацією, кошиком, фільтрацією та порівнянням товарів.

## 🛠 Технологічний стек

| Шар | Технологія |
|-----|-----------|
| Shop Frontend | Next.js 16, React 19, TypeScript, SCSS |
| Admin Panel | React 18, Vite, react-admin, TypeScript |
| База даних | MongoDB Atlas |
| Автентифікація | JWT, Firebase Auth |
| Email | Nodemailer |
| CI/CD | GitLab CI/CD (git.ztu.edu.ua) |
| Контейнеризація | Docker (multi-stage build) |

---

## 🚀 Швидкий старт

### Вимоги
- Node.js 20+
- npm або yarn
- MongoDB URI

### Shop (Next.js)

```bash
cd shop
cp .env.example .env        # заповніть змінні середовища
npm install
npm run dev                 # http://localhost:3000
```

### Admin (React + Vite)

```bash
cd admin/test-admin
yarn install
yarn dev                    # http://localhost:5173
```

---

## ⚙️ CI/CD Pipeline

Pipeline запускається автоматично при кожному `git push` і складається з 5 етапів:
build → test → lint → docker → deploy

| Етап | Jobs | Опис |
|------|------|------|
| **build** | `shop_build`, `admin_build` | Встановлення залежностей та збірка |
| **test** | `shop_test`, `admin_test`, `shop_security`, `admin_security` | Юніт-тести та аудит безпеки |
| **lint** | `shop_lint`, `admin_lint` | Статичний аналіз коду (ESLint) |
| **docker** | `docker_shop`, `docker_admin` | Збірка Docker образів (тільки main/develop) |
| **deploy** | `deploy_staging` | Розгортання (тільки main) |

### Змінні середовища CI/CD

Всі секрети зберігаються у `Settings → CI/CD → Variables` і не потрапляють у репозиторій.

---

## 🧪 Тестування

### Shop (Jest)

```bash
cd shop
npm test                    # запуск тестів
npm run test:ci             # CI режим (без watch)
```

### Admin (Vitest)

```bash
cd admin/test-admin
yarn test:ci                # запуск тестів
```

Тести охоплюють: автентифікацію, провайдер даних, компоненти адмін-панелі.

---

## 🐳 Docker

### Shop

```bash
docker build -t shop-watches:latest ./shop
docker run -p 3000:3000 shop-watches:latest
```

### Admin

```bash
docker build -t admin-watches:latest ./admin/test-admin
docker run -p 5173:5173 admin-watches:latest
```

> Docker образи збираються автоматично у CI/CD pipeline при кожному push у гілки `main` або `develop`.

---

## 📁 Структура проекту

```
RoyalTick/
├── admin/test-admin/       # Адмін-панель (Vite + React)
│   ├── components/         # UI компоненти адмінки
│   ├── src/                # Вихідний код
│   └── __tests__/          # Юніт-тести адмін-панелі
└── shop/                   # Основний клієнт (Next.js)
    ├── app/                # Next.js App Router
    │   ├── api/            # API route handlers
    │   ├── catalog/        # Каталог товарів
    │   └── cart/           # Сторінка кошика
    ├── components/         # React компоненти
    ├── hooks/              # Кастомні React хуки
    ├── lib/                # Налаштування БД (MongoDB)
    ├── context/            # Глобальний стан
    ├── styles/             # Глобальні стилі (SCSS)
    └── types/              # TypeScript інтерфейси
```

## 🔒 Безпека

- JWT токени для автентифікації API
- Firebase Auth для OAuth провайдерів
- Паролі хешуються через `bcryptjs`
- Залежності перевіряються через `npm audit` у кожному pipeline

---

## 👤 Автор

**Мінайленко Віктор** — дипломний проект, ІПЗ-22-4