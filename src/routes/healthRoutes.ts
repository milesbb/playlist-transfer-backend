import { Router } from 'express';
import { checkApiHealth } from '@controllers/health';

const router = Router();

router.get('/', checkApiHealth);

export default router;
