import { TestBed } from '@angular/core/testing';

import { SupabaseFactoryService } from './supabase-factory.service';

describe('SupabaseFactoryService', () => {
  let service: SupabaseFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
