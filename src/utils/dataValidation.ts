
import { z } from 'zod';

// Company validation schemas
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  sector: z.string().optional(),
  stage: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().max(1000, 'Description too long').optional(),
  arr: z.number().min(0, 'ARR must be positive').optional(),
  mrr: z.number().min(0, 'MRR must be positive').optional(),
  burn_rate: z.number().min(0, 'Burn rate must be positive').optional(),
  runway: z.number().min(0, 'Runway must be positive').optional(),
  headcount: z.number().int().min(0, 'Headcount must be a positive integer').optional(),
});

// Founder update validation schema
export const founderUpdateSchema = z.object({
  arr: z.number().min(0, 'ARR must be positive').optional(),
  mrr: z.number().min(0, 'MRR must be positive').optional(),
  burn_rate: z.number().min(0, 'Burn rate must be positive').optional(),
  runway: z.number().min(0, 'Runway must be positive').optional(),
  headcount: z.number().int().min(0, 'Headcount must be a positive integer').optional(),
  churn: z.number().min(0).max(100, 'Churn rate must be between 0-100%').optional(),
  raise_status: z.string().optional(),
  comments: z.string().max(2000, 'Comments too long').optional(),
  requested_intros: z.string().max(1000, 'Requested intros too long').optional(),
});

// Search validation
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(200, 'Search query too long'),
  filters: z.object({
    sectors: z.array(z.string()).optional(),
    stages: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    riskLevels: z.array(z.string()).optional(),
  }).optional(),
});

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'partner', 'founder', 'capital_team']),
});

// Generic validation helper
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Validation failed'] 
    };
  }
};

// Data sanitization helpers
export const sanitizeCompanyData = (data: any) => {
  return {
    ...data,
    name: data.name?.trim(),
    website: data.website?.trim().toLowerCase(),
    description: data.description?.trim(),
    arr: data.arr ? Math.max(0, Number(data.arr)) : undefined,
    mrr: data.mrr ? Math.max(0, Number(data.mrr)) : undefined,
    burn_rate: data.burn_rate ? Math.max(0, Number(data.burn_rate)) : undefined,
    runway: data.runway ? Math.max(0, Number(data.runway)) : undefined,
    headcount: data.headcount ? Math.max(0, Math.floor(Number(data.headcount))) : undefined,
  };
};
