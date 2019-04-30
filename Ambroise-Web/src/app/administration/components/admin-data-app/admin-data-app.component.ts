import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DataAgencyDialogComponent } from 'src/app/administration/components/data-agency-dialog/data-agency-dialog.component';
import { AdminService } from 'src/app/administration/services/admin.service';
import { Agency } from '../../models/Agency';

@Component({
  selector: 'app-admin-data-app',
  templateUrl: './admin-data-app.component.html',
  styleUrls: ['./admin-data-app.component.scss']
})
export class AdminDataAppComponent implements OnInit {
  agencies: Agency[];

  constructor(private adminService: AdminService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.fetchAgencies();
  }

  getAgencies() {
    return this.agencies;
  }

  fetchAgencies() {
    this.agencies = [];
    this.adminService.makeRequest('agencies', 'get', '', (data: string) => {
      const agenciesFetched = JSON.parse(data);
      for (const agency of agenciesFetched) {
        this.agencies.push(new Agency(agency.name, agency.place, agency.placeType));
      }
    });
  }

  onClickSynchroniseGeoApi() {
    this.adminService.makeRequest('admin/synchronize/geographics', 'post', '', '');
    // TODO Attention, on a pas de moyen de savoir si une mise à jour à été faite sur la base distante
  }

  removeAgency(agency: Agency) {
    const postParams = {
      name: agency.getName(),
      place: agency.getPlace(),
      placeType: agency.getPlaceType()
    };
    this.adminService.makeRequest('agency', 'delete', postParams, '');
  }

  addAgency() {
    const agency = new Agency('', '', '');
    const dialogAgency = this.openDialogAgency(agency);

    dialogAgency.afterClosed().subscribe(
      (data: any) => {
        if (data) {
          agency.setName(data.name);
          agency.setPlace(data.place);
          agency.setPlaceType(data.placeType);
          const postParams = {
            name: agency.getName(),
            place: agency.getPlace(),
            placeType: agency.getPlaceType()
          };
          this.adminService.makeRequest('agency', 'post', postParams, '');
          this.fetchAgencies();
          window.location.reload();
        }
      });
  }

  updateAgency(agency: Agency) {
    const dialogAgency = this.openDialogAgency(agency);

    dialogAgency.afterClosed().subscribe(
      (data: any) => {
        if (data) {
          const previousName = agency.getName();
          agency.setName(data.name);
          agency.setPlace(data.place);
          agency.setPlaceType(data.placeType);
          const postParams = {
            oldName: previousName,
            name: agency.getName(),
            place: agency.getPlace(),
            placeType: agency.getPlaceType()
          };
          this.adminService.makeRequest('agency', 'put', postParams, '');
          this.fetchAgencies();
          window.location.reload();
        }
      });
  }

  openDialogAgency(agency: Agency) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    dialogConfig.data = {
      id: 1,
      title: 'Agency edition',
      description: 'Agency edition',
      name: agency.getName(),
      place: agency.getPlace()
    };

    return this.dialog.open(DataAgencyDialogComponent, dialogConfig);
  }
}
