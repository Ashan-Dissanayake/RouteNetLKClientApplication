import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';


export const permissionGuard =
  (permission: string | string[]): CanActivateFn => {

    return () => {

      const permissionService = inject(NgxPermissionsService);
      const router = inject(Router);

      const permissions =
        Array.isArray(permission)
          ? permission
          : [permission];

      const userPermissions = permissionService.getPermissions();

      const allowed =
        permissions.some(p =>
          userPermissions.hasOwnProperty(p)
        );

      if(allowed){
        return true;
      }

      router.navigate(['/unauthorized']);
      return false;

    };

  };
