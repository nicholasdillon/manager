import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';

import { AddLinodeDrawer } from './AddLinodeDrawer';
import { AddNodebalancerDrawer } from './AddNodebalancerDrawer';
import { FirewallDeviceTable } from './FirewallDeviceTable';
import { RemoveDeviceDialog } from './RemoveDeviceDialog';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceLandingProps {
  disabled: boolean;
  firewallID: number;
  firewallLabel: string;
  type: FirewallDeviceEntityType;
}

export const formattedTypes = {
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};

const helperText =
  'Assign one or more devices to this firewall. You can add devices later if you want to customize your rules first.';

export const FirewallDeviceLanding = React.memo(
  (props: FirewallDeviceLandingProps) => {
    const { disabled, firewallID, firewallLabel, type } = props;

    const { data: allDevices, error, isLoading } = useAllFirewallDevicesQuery(
      firewallID
    );

    const devices =
      allDevices?.filter((device) => device.entity.type === type) || [];

    const [
      isRemoveDeviceDialogOpen,
      setIsRemoveDeviceDialogOpen,
    ] = React.useState<boolean>(false);

    const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(-1);

    const selectedDevice = devices?.find(
      (device) => device.id === selectedDeviceId
    );

    const [addDeviceDrawerOpen, setDeviceDrawerOpen] = React.useState<boolean>(
      false
    );

    const handleClose = () => {
      setDeviceDrawerOpen(false);
    };

    const formattedType = formattedTypes[type];

    return (
      <>
        {disabled ? (
          <Notice
            text={
              "You don't have permissions to modify this Firewall. Please contact an account administrator for details."
            }
            important
            variant="error"
          />
        ) : null}
        <Grid container direction="column">
          <Grid sx={{ paddingBottom: 0, width: 'calc(100% - 300px)' }}>
            <StyledTypography>
              The following {formattedType}s have been assigned to this
              Firewall. A {formattedType} can only be assigned to a single
              Firewall.
              <Link to="#">
                Learn about how Firewall rules apply to {formattedType}s.
              </Link>
              {/* @todo add documentation link */}
            </StyledTypography>
          </Grid>
          <StyledGrid>
            <Button
              buttonType="primary"
              data-testid="add-device-button"
              disabled={disabled}
              onClick={() => setDeviceDrawerOpen(true)}
            >
              Add {formattedType}s to Firewall
            </Button>
          </StyledGrid>
        </Grid>
        <FirewallDeviceTable
          triggerRemoveDevice={(id) => {
            setSelectedDeviceId(id);
            setIsRemoveDeviceDialogOpen(true);
          }}
          deviceType={type}
          devices={devices ?? []}
          disabled={disabled}
          error={error ?? undefined}
          loading={isLoading}
        />
        {type === 'linode' ? (
          <AddLinodeDrawer
            helperText={helperText}
            onClose={handleClose}
            open={addDeviceDrawerOpen}
          />
        ) : (
          <AddNodebalancerDrawer
            helperText={helperText}
            onClose={handleClose}
            open={addDeviceDrawerOpen}
          />
        )}
        <RemoveDeviceDialog
          device={selectedDevice}
          firewallId={firewallID}
          firewallLabel={firewallLabel}
          linodeId={selectedDevice?.entity.id}
          onClose={() => setIsRemoveDeviceDialogOpen(false)}
          open={isRemoveDeviceDialogOpen}
        />
      </>
    );
  }
);

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    fontSize: '0.875rem',
    marginTop: theme.spacing(),
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  })
);

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  '&.MuiGrid-item': {
    paddingTop: 0,
  },
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(),
  [theme.breakpoints.only('sm')]: {
    marginRight: theme.spacing(),
  },
}));
