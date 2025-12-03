import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
} from '@mui/material';

interface EditProviderDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editName: string;
    onEditNameChange: (value: string) => void;
    editApiBase: string;
    onEditApiBaseChange: (value: string) => void;
    editApiVersion: string;
    onEditApiVersionChange: (value: string) => void;
    editToken: string;
    onEditTokenChange: (value: string) => void;
    editEnabled: boolean;
    onEditEnabledChange: (enabled: boolean) => void;
}

const EditProviderDialog = ({
    open,
    onClose,
    onSubmit,
    editName,
    onEditNameChange,
    editApiBase,
    onEditApiBaseChange,
    editApiVersion,
    onEditApiVersionChange,
    editToken,
    onEditTokenChange,
    editEnabled,
    onEditEnabledChange,
}: EditProviderDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Provider</DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            fullWidth
                            label="Provider Name"
                            value={editName}
                            onChange={(e) => onEditNameChange(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            label="API Base URL"
                            value={editApiBase}
                            onChange={(e) => onEditApiBaseChange(e.target.value)}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel id="edit-api-version-label">API Version</InputLabel>
                            <Select
                                labelId="edit-api-version-label"
                                value={editApiVersion}
                                label="API Version"
                                onChange={(e) => onEditApiVersionChange(e.target.value)}
                            >
                                <MenuItem value="openai">OpenAI</MenuItem>
                                <MenuItem value="anthropic">Anthropic</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="API Token"
                            type="password"
                            value={editToken}
                            onChange={(e) => onEditTokenChange(e.target.value)}
                            helperText="Leave empty to keep current token"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editEnabled}
                                    onChange={(e) => onEditEnabledChange(e.target.checked)}
                                />
                            }
                            label="Enabled"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save Changes</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditProviderDialog;