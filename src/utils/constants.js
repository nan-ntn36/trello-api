import { env } from '~/config/environment';

export const WHITELIST_DOMAINS = [
  'https://trello-web-sigma-three.vercel.app',
  // 'http://localhost:5173' không cần localhost nữa vì ở config đã luôn luôn cho phép môi trường đẹp
]; // domain được cho phép truy cập đến api

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'production'
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;
export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 12;

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION',
};

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};
export const CARD_MEMBER_ACTION = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};
